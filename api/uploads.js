const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const authMiddleware = require('../src/Auth');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function safeClientId(value) {
    if (value === undefined || value === null) return 'unknown';
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64) || 'unknown';
}

function publicBaseUrl(req) {
    // Prefer explicit public base URL for production so VoIP.ms can reach it.
    // Example: https://api.yourdomain.com
    const base = process.env.PUBLIC_BASE_URL;
    if (base && typeof base === 'string' && base.trim()) {
        return base.replace(/\/$/, '');
    }

    return `${req.protocol}://${req.get('host')}`;
}

function isLikelyPublicBaseUrl(baseUrl) {
    try {
        const url = new URL(baseUrl);
        const hostname = (url.hostname || '').toLowerCase();
        if (hostname === 'localhost' || hostname.endsWith('.local')) return false;
        if (hostname === '127.0.0.1' || hostname === '::1') return false;
        if (hostname.startsWith('192.168.') || hostname.startsWith('10.')) return false;
        return true;
    } catch {
        return false;
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureDir(UPLOADS_DIR);

        const clientId = safeClientId(req.user?.voipms_client_id);
        const clientDir = path.join(UPLOADS_DIR, clientId);
        ensureDir(clientDir);

        cb(null, clientDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').slice(0, 12);
        const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
        cb(null, `${id}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.UPLOAD_MAX_BYTES || '10485760', 10) // 10MB default
    },
    fileFilter: (req, file, cb) => {
        const allowed = new Set([
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ]);

        if (!allowed.has(file.mimetype)) {
            return cb(new Error('Only image uploads are allowed (jpeg, png, gif, webp)'));
        }

        cb(null, true);
    }
});

// POST /api/uploads
// form-data: file=<image>
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded (field name: file)' });
    }

    const clientId = safeClientId(req.user?.voipms_client_id);
    const relativePath = `/uploads/${encodeURIComponent(clientId)}/${encodeURIComponent(req.file.filename)}`;
    const baseUrl = publicBaseUrl(req);
    const url = `${baseUrl}${relativePath}`;

    const warning = isLikelyPublicBaseUrl(baseUrl)
        ? undefined
        : 'This upload URL is likely not publicly reachable by VoIP.ms (localhost/private). Set PUBLIC_BASE_URL to your public API domain for MMS to work.';

    // Note: If you are running locally (localhost), VoIP.ms cannot fetch this URL.
    // In production, set PUBLIC_BASE_URL to your public API domain.
    res.json({
        success: true,
        data: {
            url,
            path: relativePath,
            size: req.file.size,
            mime: req.file.mimetype,
            ...(warning ? { warning } : {})
        }
    });
});

module.exports = router;
