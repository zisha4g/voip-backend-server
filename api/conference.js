const express = require('express');
const router = express.Router();
const voipmsClient = require('../src/VoipmsClient');

// Get conferences
router.get('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.getConference(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get conference members
router.get('/:id/members', async (req, res, next) => {
    try {
        const data = await voipmsClient.getConferenceMembers({
            conference: req.params.id,
            ...req.query
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get conference recordings
router.get('/:id/recordings', async (req, res, next) => {
    try {
        const data = await voipmsClient.getConferenceRecordings({
            conference: req.params.id,
            ...req.query
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Create/Update conference
router.post('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.setConference(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Delete conference
router.delete('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.delConference({ conference: req.params.id });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
