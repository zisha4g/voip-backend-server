const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const net = require('net');
const voipmsClient = require('../src/VoipmsClient');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

function pickDateRange(query) {
    const today = new Date();
    const defaultFromDate = new Date(today);
    // VoIP.ms `getSMS` appears to reject > ~90 day ranges (invalid_daterange).
    defaultFromDate.setDate(today.getDate() - 90);

    const from = (query.from || query.date_from || defaultFromDate.toISOString().split('T')[0]);
    const to = (query.to || query.date_to || today.toISOString().split('T')[0]);
    return { from, to };
}

function sanitizeQueryParams(query) {
    const params = { ...query };
    delete params.client;
    delete params.limit;
    delete params.timezone;
    delete params.from;
    delete params.to;
    delete params.date_from;
    delete params.date_to;
    // These filters are applied locally because VoIP.ms filtering is unreliable.
    delete params.did;
    delete params.contact;
    return params;
}

function isPrivateIp(ip) {
    // IPv4 private ranges: 10/8, 172.16/12, 192.168/16, plus loopback/link-local
    const parts = ip.split('.').map(n => Number(n));
    if (parts.length !== 4 || parts.some(n => !Number.isFinite(n))) return false;

    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    return false;
}

function isPublicMediaUrl(mediaUrl) {
    try {
        const url = new URL(mediaUrl);
        const hostname = (url.hostname || '').toLowerCase();

        if (!['http:', 'https:'].includes(url.protocol)) return false;
        if (!hostname) return false;
        if (hostname === 'localhost' || hostname.endsWith('.local')) return false;

        const ipType = net.isIP(hostname);
        if (ipType === 4 && isPrivateIp(hostname)) return false;
        // Block common IPv6 localhost.
        if (ipType === 6 && (hostname === '::1' || hostname === '0:0:0:0:0:0:0:1')) return false;

        return true;
    } catch {
        return false;
    }
}

// Middleware to extract client_id from token
const getClientId = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.clientId = decoded.voipms_client_id;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// Get SMS messages
router.get('/', getClientId, async (req, res, next) => {
    try {
        // First get user's DIDs
        const didsData = await voipmsClient.getDIDsInfo({
            client: req.clientId
        });
        
        if (didsData.status !== 'success' || !didsData.dids) {
            return res.json({ success: true, data: { status: 'success', sms: [] } });
        }
        
        // Extract DID numbers
        const userDIDs = didsData.dids.map(d => d.did);

        const requestedDID = req.query.did;
        if (requestedDID && !userDIDs.includes(requestedDID)) {
            return res.status(403).json({ success: false, error: 'You do not own this DID' });
        }
        const requestedContact = req.query.contact;

        const { from, to } = pickDateRange(req.query);
        const limit = Number.isFinite(Number(req.query.limit)) ? Number(req.query.limit) : 1000;
        const timezone = req.query.timezone || '-5';
        const extraParams = sanitizeQueryParams(req.query);

        // VoIP.ms appears to honor `from`/`to` (not `date_from`/`date_to`).
        let data = await voipmsClient.getSMS({
            client: req.clientId,
            limit,
            from,
            to,
            timezone,
            ...extraParams
        });

        // If user provided an out-of-range request, fall back to the default window.
        if (data.status === 'invalid_daterange') {
            const fallback = pickDateRange({});
            data = await voipmsClient.getSMS({
                client: req.clientId,
                limit,
                from: fallback.from,
                to: fallback.to,
                timezone,
                ...extraParams
            });
        }
        
        // Filter to only messages from user's DIDs
        if (data.status === 'success' && data.sms) {
            const beforeFilter = data.sms.length;
            data.sms = data.sms.filter(msg => userDIDs.includes(msg.did));
            if (requestedDID) {
                data.sms = data.sms.filter(msg => msg.did === requestedDID);
            }
            if (requestedContact) {
                data.sms = data.sms.filter(msg => msg.contact === requestedContact);
            }
            console.log(`SMS: ${beforeFilter} total → ${data.sms.length} for user DIDs`);
        }

        res.set('Cache-Control', 'no-store');
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get MMS messages
router.get('/mms', getClientId, async (req, res, next) => {
    try {
        // First get user's DIDs
        const didsData = await voipmsClient.getDIDsInfo({
            client: req.clientId
        });
        
        if (didsData.status !== 'success' || !didsData.dids) {
            return res.json({ success: true, data: { status: 'success', mms: [] } });
        }
        
        // Extract DID numbers
        const userDIDs = didsData.dids.map(d => d.did);

        const requestedDID = req.query.did;
        if (requestedDID && !userDIDs.includes(requestedDID)) {
            return res.status(403).json({ success: false, error: 'You do not own this DID' });
        }
        const requestedContact = req.query.contact;

        const limit = Number.isFinite(Number(req.query.limit)) ? Number(req.query.limit) : 1000;
        const timezone = req.query.timezone || '-5';
        const extraParams = sanitizeQueryParams(req.query);

        // Get all MMS (include client)
        const data = await voipmsClient.getMMS({
            client: req.clientId,
            limit,
            timezone,
            ...extraParams
        });
        
        // Filter MMS to only those matching user's DIDs
        if (data.status === 'success' && data.mms) {
            data.mms = data.mms.filter(msg => userDIDs.includes(msg.did));
            if (requestedDID) {
                data.mms = data.mms.filter(msg => msg.did === requestedDID);
            }
            if (requestedContact) {
                data.mms = data.mms.filter(msg => msg.contact === requestedContact);
            }
        }

        res.set('Cache-Control', 'no-store');
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Send SMS
router.post('/', getClientId, async (req, res, next) => {
    try {
        // Verify the DID belongs to this user
        const didsData = await voipmsClient.getDIDsInfo({
            client: req.clientId
        });
        
        if (didsData.status !== 'success' || !didsData.dids) {
            return res.status(403).json({ success: false, error: 'No DIDs found for this account' });
        }
        
        const userDIDs = didsData.dids.map(d => d.did);
        
        if (!userDIDs.includes(req.body.did)) {
            return res.status(403).json({ success: false, error: 'You do not own this DID' });
        }
        
        const data = await voipmsClient.sendSMS(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Send MMS
router.post('/mms', getClientId, async (req, res, next) => {
    try {
        // Verify the DID belongs to this user
        const didsData = await voipmsClient.getDIDsInfo({
            client: req.clientId
        });
        
        if (didsData.status !== 'success' || !didsData.dids) {
            return res.status(403).json({ success: false, error: 'No DIDs found for this account' });
        }
        
        const userDIDs = didsData.dids.map(d => d.did);
        
        if (!userDIDs.includes(req.body.did)) {
            return res.status(403).json({ success: false, error: 'You do not own this DID' });
        }

        // VoIP.ms sendMMS expects media as a URL (http/https) it can fetch.
        // Reject base64/data URLs early to avoid huge payloads and 414/413 errors.
        if (typeof req.body.media1 === 'string') {
            const media1 = req.body.media1.trim();

            // Treat blank/whitespace as "no media".
            if (media1.length === 0) {
                delete req.body.media1;
            } else {
                const isHttpUrl = /^https?:\/\//i.test(media1);
                const looksLikeDataUrl = /^data:/i.test(media1);
                const suspiciouslyLong = media1.length > 2048;

                if (!isHttpUrl || looksLikeDataUrl || suspiciouslyLong) {
                    return res.status(400).json({
                        success: false,
                        code: 'invalid_media1',
                        error: 'Invalid media1: must be a public http(s) URL. Base64/data URLs are not supported.'
                    });
                }

                // Must be publicly reachable by VoIP.ms. Localhost/private IPs will fail.
                if (!isPublicMediaUrl(media1)) {
                    return res.status(400).json({
                        success: false,
                        code: 'media1_not_public',
                        error: 'media1 must be a publicly reachable URL (not localhost/private IP). Set PUBLIC_BASE_URL on the backend or use a public hosting/URL (ngrok, Cloudinary, S3, etc.).'
                    });
                }

                req.body.media1 = media1;
            }
        }

        try {
            const data = await voipmsClient.sendMMS(req.body);
            res.json({ success: true, data });
        } catch (error) {
            // Preserve VoIP.ms response payload when available.
            const status = error?.response?.status;
            const responseData = error?.response?.data;
            if (responseData) {
                return res.status(502).json({
                    success: false,
                    code: 'voipms_error',
                    error: 'VoIP.ms sendMMS failed',
                    voipms: responseData,
                    ...(status ? { voipms_http_status: status } : {})
                });
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
});

// Delete SMS
router.delete('/:id', getClientId, async (req, res, next) => {
    try {
        // Get user's DIDs to verify they own the SMS
        const didsData = await voipmsClient.getDIDsInfo({
            client: req.clientId
        });
        
        if (didsData.status !== 'success' || !didsData.dids) {
            return res.status(403).json({ success: false, error: 'No DIDs found for this account' });
        }
        
        const userDIDs = didsData.dids.map(d => d.did);

        const { from, to } = pickDateRange(req.query);
        const limit = 1000;
        const timezone = req.query.timezone || '-5';

        // Get SMS to check if it belongs to user (within a date range)
        const allSMS = await voipmsClient.getSMS({
            client: req.clientId,
            limit,
            from,
            to,
            timezone
        });

        if (allSMS.status !== 'success' || !Array.isArray(allSMS.sms)) {
            return res.status(404).json({ success: false, error: 'SMS not found (or not accessible in this date range)' });
        }

        const ownedSMS = allSMS.sms.filter(msg => userDIDs.includes(msg.did));
        const message = ownedSMS.find(msg => msg.id === req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, error: 'SMS not found (or not owned by you)' });
        }
        
        const data = await voipmsClient.deleteSMS({
            id: req.params.id
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
