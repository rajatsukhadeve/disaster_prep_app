const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'school', 'ddma'] // The role must be one of these values
    },
    schoolId: { // An example field for connecting users to an institution
        type: String
    }
});

module.exports = mongoose.model('User', userSchema);