// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Alert = require('./models/alert'); // We will create this model soon

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database Connection ---
// Make sure your local MongoDB server is running!
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- Middleware ---
// Set the view engine to EJS
app.set('view engine', 'ejs');
// Set the directory for EJS templates
app.set('views', path.join(__dirname, 'views'));
// Serve static files (CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));
// Parse JSON bodies
app.use(bodyParser.json());


// --- Routes ---
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});