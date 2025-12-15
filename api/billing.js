const express = require('express');
const router = express.Router();
const voipmsClient = require('../src/VoipmsClient');

// Get account balance
router.get('/balance', async (req, res, next) => {
    try {
        const data = await voipmsClient.getBalance(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get charges
router.get('/charges', async (req, res, next) => {
    try {
        const data = await voipmsClient.getCharges(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get transaction history
router.get('/transactions', async (req, res, next) => {
    try {
        const data = await voipmsClient.getTransactionHistory(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get packages
router.get('/packages', async (req, res, next) => {
    try {
        const data = await voipmsClient.getPackages(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get rates
router.get('/rates', async (req, res, next) => {
    try {
        const data = await voipmsClient.getRates(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
