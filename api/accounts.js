const express = require('express');
const router = express.Router();
const voipmsClient = require('../src/VoipmsClient');

// Get sub accounts
router.get('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.getSubAccounts(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get registration status
router.get('/status', async (req, res, next) => {
    try {
        const data = await voipmsClient.getRegistrationStatus(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Create sub account
router.post('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.createSubAccount(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Update sub account
router.put('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.setSubAccount({
            account: req.params.id,
            ...req.body
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Delete sub account
router.delete('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.delSubAccount({ account: req.params.id });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
