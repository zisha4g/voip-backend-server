require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./src/CORS');
const logger = require('./src/Logger');

// Import route modules
const authRouter = require('./api/auth');
const didsRouter = require('./api/dids');
const voicemailRouter = require('./api/voicemail');
const smsRouter = require('./api/sms');
const cdrRouter = require('./api/cdr');
const accountsRouter = require('./api/accounts');
const ivrRouter = require('./api/ivr');
const faxRouter = require('./api/fax');
const queuesRouter = require('./api/queues');
const recordingsRouter = require('./api/recordings');
const billingRouter = require('./api/billing');
const forwardingRouter = require('./api/forwarding');
const conferenceRouter = require('./api/conference');
const uploadsRouter = require('./api/uploads');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(corsMiddleware);
// MMS payloads can be large (base64/media). Increase limits from Express defaults.
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '15mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_BODY_LIMIT || '15mb' }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/auth', authRouter); // Public auth endpoints
app.use('/api/dids', didsRouter);
app.use('/api/voicemail', voicemailRouter);
app.use('/api/sms', smsRouter);
app.use('/api/cdr', cdrRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/ivr', ivrRouter);
app.use('/api/fax', faxRouter);
app.use('/api/queues', queuesRouter);
app.use('/api/recordings', recordingsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/forwarding', forwardingRouter);
app.use('/api/conference', conferenceRouter);
app.use('/api/uploads', uploadsRouter);

// Serve uploaded media. VoIP.ms must be able to fetch media1 URLs.
// If you want this to work in production, ensure PUBLIC_BASE_URL points at a public domain.
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    fallthrough: false,
    setHeaders: (res) => {
        // Avoid caching sensitive media on shared machines/proxies.
        res.setHeader('Cache-Control', 'no-store');
    }
}));

// Error handling
app.use((err, req, res, next) => {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path
    });

    res.status(err.statusCode || 500).json({
        success: false,
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    console.log(`\n🚀 VoIP.ms Backend Server`);
    console.log(`📍 Running on: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`\n📚 API Endpoints:`);
    console.log(`   http://localhost:${PORT}/api/dids`);
    console.log(`   http://localhost:${PORT}/api/voicemail`);
    console.log(`   http://localhost:${PORT}/api/sms`);
    console.log(`   http://localhost:${PORT}/api/cdr`);
    console.log(`   http://localhost:${PORT}/api/accounts`);
    console.log(`   http://localhost:${PORT}/api/ivr`);
    console.log(`   http://localhost:${PORT}/api/fax`);
    console.log(`   And more...\n`);
});
