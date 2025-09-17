const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    issuedAt: {
        type: Date,
        default: Date.now
    }
});

// Create a TTL index to automatically delete alerts after 1 day (optional but good practice)
alertSchema.index({ issuedAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Alert', alertSchema);