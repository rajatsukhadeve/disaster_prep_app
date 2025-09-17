const express = require('express');
const router = express.Router();
const Alert = require('../models/alert');

// --- Page Rendering Routes ---

// GET: Render the main login page
router.get('/', (req, res) => {
    res.render('index', { title: 'Welcome' });
});

// GET: Render the Student Dashboard
router.get('/student', async (req, res) => {
    try {
        // Find the most recent alert to display
        const latestAlert = await Alert.findOne().sort({ issuedAt: -1 });
        res.render('student_dashboard', { title: 'Student Dashboard', alert: latestAlert });
    } catch (err) {
        res.status(500).send('Error loading page');
    }
});

// GET: Render the School/College Dashboard
router.get('/school', async (req, res) => {
    try {
        const latestAlert = await Alert.findOne().sort({ issuedAt: -1 });
        res.render('school_dashboard', { title: 'School Dashboard', alert: latestAlert });
    } catch (err) {
        res.status(500).send('Error loading page');
    }
});

// GET: Render the DDMA Dashboard
router.get('/ddma', async (req, res) => {
     try {
        const recentAlerts = await Alert.find().sort({ issuedAt: -1 }).limit(5);
        res.render('ddma_dashboard', { title: 'DDMA Dashboard', recentAlerts: recentAlerts });
    } catch (err) {
        res.status(500).send('Error loading page');
    }
});

// GET: Render the Quiz page
router.get('/quiz', (req, res) => {
    res.render('quiz', { title: 'Disaster Quiz' });
});

// GET: Render the Emergency Contacts page
router.get('/contacts', (req, res) => {
    res.render('emergency_contacts', { title: 'Emergency Contacts' });
});


// --- API Logic Routes ---

// POST: Create a new alert (from DDMA dashboard)
router.post('/alerts', async (req, res) => {
    const { title, message, region, severity } = req.body;
    const newAlert = new Alert({
        title,
        message,
        region,
        severity
    });
    try {
        await newAlert.save();
        res.redirect('/ddma'); // Redirect back to the DDMA dashboard
    } catch (err) {
        res.status(500).send("Failed to create alert.");
    }
});

// POST: Delete an alert
router.post('/alerts/delete/:id', async (req, res) => {
    try {
        const alertId = req.params.id;
        await Alert.findByIdAndDelete(alertId);
        res.redirect('/ddma'); // Redirect back to the DDMA dashboard to see the updated list
    } catch (err) {
        console.error("Error deleting alert:", err);
        res.status(500).send("Failed to delete alert.");
    }
});

module.exports = router;