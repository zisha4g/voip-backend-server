const express = require('express');
const router = express.Router();
const voipmsClient = require('../src/VoipmsClient');

// Get call detail records
router.get('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.getCDR(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get call types
router.get('/types', async (req, res, next) => {
    try {
        const data = await voipmsClient.getCallTypes(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get call accounts
router.get('/accounts', async (req, res, next) => {
    try {
        const data = await voipmsClient.getCallAccounts(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
