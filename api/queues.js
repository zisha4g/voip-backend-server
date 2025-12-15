const express = require('express');
const router = express.Router();
const voipmsClient = require('../src/VoipmsClient');

// Get all queues
router.get('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.getQueues(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get static members
router.get('/:id/members', async (req, res, next) => {
    try {
        const data = await voipmsClient.getStaticMembers({
            queue: req.params.id,
            ...req.query
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Create/Update queue
router.post('/', async (req, res, next) => {
    try {
        const data = await voipmsClient.setQueue(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Update queue
router.put('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.setQueue({
            queue: req.params.id,
            ...req.body
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Delete queue
router.delete('/:id', async (req, res, next) => {
    try {
        const data = await voipmsClient.delQueue({ queue: req.params.id });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
