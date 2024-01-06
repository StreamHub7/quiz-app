const mongoose = require('mongoose');

const streamdataSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Streamdata', streamdataSchema);