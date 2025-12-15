const express = require('express');
const router = express.Router();
const voipmsClient = require('../src/VoipmsClient');

// Get voicemail boxes
router.get('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.getVoicemails(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get voicemail folders
router.get('/folders', async (req, res, next) => {
    try {
        const data = await voipmsClient.getVoicemailFolders(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get voicemail messages
router.get('/messages', async (req, res, next) => {
    try {
        const data = await voipmsClient.getVoicemailMessages(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get voicemail message file
router.get('/messages/:id/file', async (req, res, next) => {
    try {
        const data = await voipmsClient.getVoicemailMessageFile({
            ...req.query,
            message_num: req.params.id
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Create voicemail
router.post('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.createVoicemail(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Update voicemail
router.put('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.setVoicemail({
            voicemail: req.params.id,
            ...req.body
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Delete voicemail
router.delete('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.delVoicemail({ voicemail: req.params.id });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
