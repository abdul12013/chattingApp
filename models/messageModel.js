const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
   
    message: {
        type: String,
        required: true
    },
   
});

const chat = mongoose.model('chat', chatSchema);
module.exports = chat;
