const mongoose = require('mongoose');

const drillSchema = new mongoose.Schema({
    title: { type: String, required: true },
    drillType: {
        type: String,
        required: true,
        enum: ['Fire', 'Earthquake', 'Flood', 'Other']
    },
    scheduledFor: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed'],
        default: 'Scheduled'
    }
});

module.exports = mongoose.model('Drill', drillSchema);