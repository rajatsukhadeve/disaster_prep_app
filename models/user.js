const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: { // For future real login system
        type: String,
        default: 'password'
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'school', 'ddma'],
        default: 'student'
    },
    // NEW FIELD for gamification
    
    xp: {
        type: Number,
        default: 0
    },
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

module.exports = mongoose.model('User', userSchema);