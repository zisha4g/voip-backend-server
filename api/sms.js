const express = require('express');
const router = express.Router();
const voipmsClient = require('../src/VoipmsClient');

// Get SMS messages
router.get('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.getSMS(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get MMS messages
router.get('/mms', async (req, res, next) => {
    try {
        const data = await voipmsClient.getMMS(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Send SMS
router.post('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.sendSMS(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Send MMS
router.post('/mms', async (req, res, next) => {
    try {
        const data = await voipmsClient.sendMMS(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Delete SMS
router.delete('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.deleteSMS({ id: req.params.id });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
