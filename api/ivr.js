const express = require('express');
const router = express.Router();
const voipmsClient = require('../src/VoipmsClient');

// Get all IVRs
router.get('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.getIVRs(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Create/Update IVR
router.post('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.setIVR(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Update IVR
router.put('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.setIVR({
            ivr: req.params.id,
            ...req.body
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Delete IVR
router.delete('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.delIVR({ ivr: req.params.id });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
