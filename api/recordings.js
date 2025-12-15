const express = require('express');
const router = express.Router();
const voipmsClient = require('../src/VoipmsClient');

// Get all recordings
router.get('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.getRecordings(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get recording file
router.get('/:id/file', async (req, res, next) => {
    try {
        const data = await voipmsClient.getRecordingFile({
            recording: req.params.id,
            ...req.query
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Upload/Update recording
router.post('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.setRecording(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Delete recording
router.delete('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.delRecording({ recording: req.params.id });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
