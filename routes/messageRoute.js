const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get all chat messages
router.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().populate('user', 'username').sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
