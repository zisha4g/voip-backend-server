const express = require('express');
const router = express.Router();
const voipmsClient = require('../src/VoipmsClient');

// Get all DIDs
router.get('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.getDIDsInfo(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Search DIDs (Canada)
router.get('/search/canada', async (req, res, next) => {
    try {
        const data = await voipmsClient.searchDIDsCAN(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Search DIDs (USA)
router.get('/search/usa', async (req, res, next) => {
    try {
        const data = await voipmsClient.searchDIDsUSA(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Order DID
router.post('/order', async (req, res, next) => {
    try {
        const data = await voipmsClient.orderDID(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Cancel DID
router.delete('/:did', async (req, res, next) => {
    try {
        const data = await voipmsClient.cancelDID({ did: req.params.did });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Set DID routing
router.put('/:did/routing', async (req, res, next) => {
    try {
        const data = await voipmsClient.setDIDRouting({
            did: req.params.did,
            ...req.body
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
