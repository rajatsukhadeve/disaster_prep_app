// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- Seed Database with Dummy Students (for demo purposes) ---
const User = require('./models/user');
async function seedUsers() {
    try {
        const count = await User.countDocuments({ role: 'student' });
        if (count > 0) {
            console.log('Student users already exist. Skipping seed.');
            return;
        }
        console.log('No student users found. Seeding database...');
        const students = [
            { username: 'Priya', xp: 120, role: 'student' },
            { username: 'Amit', xp: 90, role: 'student' },
            { username: 'Sunita', xp: 150, role: 'student' },
            { username: 'Rohan', xp: 70, role: 'student' }
        ];
        await User.insertMany(students);
        console.log('Dummy student users created!');
    } catch (error) {
        console.error('Error seeding users:', error);
    }
}

// Call the function to seed users after DB connection
mongoose.connection.once('open', () => {
    seedUsers();
});


// --- Middleware ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// --- Routes ---
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});