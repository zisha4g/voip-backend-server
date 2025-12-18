const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const voipmsClient = require('../src/VoipmsClient');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

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

// Get voicemail boxes
router.get('/', getClientId, async (req, res, next) => {
    try {
        const data = await voipmsClient.getVoicemails({
            client: req.clientId,
            ...req.query
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get voicemail folders
router.get('/folders', getClientId, async (req, res, next) => {
    try {
        const data = await voipmsClient.getVoicemailFolders({
            client: req.clientId,
            ...req.query
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get voicemail messages
router.get('/messages', getClientId, async (req, res, next) => {
    try {
        const data = await voipmsClient.getVoicemailMessages({
            client: req.clientId,
            ...req.query
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get voicemail message file
router.get('/messages/:id/file', getClientId, async (req, res, next) => {
    try {
        const data = await voipmsClient.getVoicemailMessageFile({
            client: req.clientId,
            message_num: req.params.id,
            ...req.query
        });
        
        // Convert base64 to buffer and stream as audio
        const base64Data = data.message.data;
        const audioBuffer = Buffer.from(base64Data, 'base64');
        
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.length);
        res.send(audioBuffer);
    } catch (error) {
        next(error);
    }
});

// Create voicemail
router.post('/', getClientId, async (req, res, next) => {
    try {
        const data = await voipmsClient.createVoicemail({
            client: req.clientId,
            ...req.body
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Delete voicemail message (must be before /:id route)
router.delete('/messages/:message_num', getClientId, async (req, res, next) => {
    try {
        const data = await voipmsClient.delMessages({
            client: req.clientId,
            message_num: req.params.message_num,
            ...req.query
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Update voicemail
router.put('/:id', getClientId, async (req, res, next) => {
    try {
        const data = await voipmsClient.setVoicemail({
            client: req.clientId,
            voicemail: req.params.id,
            ...req.body
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Delete voicemail box
router.delete('/:id', getClientId, async (req, res, next) => {
    try {
        const data = await voipmsClient.delVoicemail({
            client: req.clientId,
            voicemail: req.params.id
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
