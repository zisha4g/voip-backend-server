const express = require('express');
const router = express.Router();
const voipmsClient = require('../src/VoipmsClient');

// Get forwardings
router.get('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.getForwardings(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Create/Update forwarding
router.post('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.setForwarding(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Update forwarding
router.put('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.setForwarding({
            forwarding: req.params.id,
            ...req.body
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Delete forwarding
router.delete('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.delForwarding({ forwarding: req.params.id });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
