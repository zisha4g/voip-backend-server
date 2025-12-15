const express = require('express');
const router = express.Router();
const voipmsClient = require('../src/VoipmsClient');

// Get fax numbers
router.get('/numbers', async (req, res, next) => {
    try {
        const data = await voipmsClient.getFaxNumbersInfo(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get fax messages
router.get('/messages', async (req, res, next) => {
    try {
        const data = await voipmsClient.getFaxMessages(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get fax message PDF
router.get('/messages/:id/pdf', async (req, res, next) => {
    try {
        const data = await voipmsClient.getFaxMessagePDF({
            ...req.query,
            id: req.params.id
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Send fax
router.post('/send', async (req, res, next) => {
    try {
        const data = await voipmsClient.sendFaxMessage(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Delete fax message
router.delete('/messages/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.deleteFaxMessage({ id: req.params.id });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
