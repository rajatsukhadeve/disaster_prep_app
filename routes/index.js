const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const Alert = require('../models/alert');
const User = require('../models/user');
const Course = require('../models/course');
const Lesson = require('../models/lesson');
const Drill = require('../models/drill');

const upload = multer({ dest: 'uploads/' });

// --- Page Rendering Routes ---

router.get('/', (req, res) => {
    res.render('index', { title: 'Welcome' });
});

router.get('/school', (req, res) => {
    res.render('school_dashboard', { title: 'School Admin', alert: null });
});

router.get('/student', async (req, res) => {
    try {
        const latestAlert = await Alert.findOne().sort({ issuedAt: -1 });
        const demoUserId = "68ca7e2c77b55d5a050def87"; // Your ID is here
        const studentUser = await User.findById(demoUserId);
        const upcomingDrill = await Drill.findOne({ status: 'Scheduled', scheduledFor: { $gte: new Date() } }).sort({ scheduledFor: 1 });
        let badge = { name: 'Newbie', color: 'light', icon: '🌱' };
        if (studentUser) {
            if (studentUser.xp >= 150) { badge = { name: 'Gold Pro', color: 'warning', icon: '🥇' }; } 
            else if (studentUser.xp >= 100) { badge = { name: 'Silver Knight', color: 'secondary', icon: '🥈' }; } 
            else if (studentUser.xp > 0) { badge = { name: 'Bronze Learner', color: 'danger', icon: '🥉' }; }
        }
        res.render('student_dashboard', { title: 'Student Dashboard', alert: latestAlert, user: studentUser, badge: badge, upcomingDrill: upcomingDrill });
    } catch (err) {
        console.error("Error loading student dashboard:", err);
        res.status(500).send('Error loading page');
    }
});

router.get('/ddma', async (req, res) => {
     try {
        const recentAlerts = await Alert.find().sort({ issuedAt: -1 }).limit(5);
        res.render('ddma_dashboard', { title: 'DDMA Dashboard', recentAlerts: recentAlerts });
    } catch (err) { res.status(500).send('Error loading page'); }
});

router.get('/quiz', (req, res) => { res.render('quiz', { title: 'Disaster Quiz' }); });
router.get('/contacts', (req, res) => { res.render('emergency_contacts', { title: 'Emergency Contacts' }); });
router.get('/vr-drill', (req, res) => { res.render('vr_drill'); });

// --- Admin & Management Routes ---
router.get('/admin/dashboard', async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const courseCount = await Course.countDocuments();
        const avgXpResult = await User.aggregate([ { $match: { role: 'student' } }, { $group: { _id: null, averageXp: { $avg: '$xp' } } } ]);
        const averageXp = avgXpResult.length > 0 ? avgXpResult[0].averageXp.toFixed(0) : 0;
        const topStudents = await User.find({ role: 'student' }).sort({ xp: -1 }).limit(5);
        res.render('admin_dashboard', { title: 'Preparedness Dashboard', totalStudents, courseCount, averageXp, topStudents });
    } catch (error) { res.status(500).send("Could not load dashboard data."); }
});

router.get('/admin/analytics', async (req, res) => {
    try {
        const courseCompletions = await User.aggregate([ { $unwind: '$completedCourses' }, { $group: { _id: '$completedCourses', count: { $sum: 1 } } }, { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'courseDetails' } }, { $unwind: '$courseDetails' }, { $project: { courseTitle: '$courseDetails.title', completionCount: '$count', _id: 0 } } ]);
        const xpDistribution = await User.aggregate([ { $match: { role: 'student' } }, { $bucket: { groupBy: "$xp", boundaries: [0, 50, 100, 150, 200, 300], default: "300+", output: { "count": { $sum: 1 } } } } ]);
        res.render('admin_analytics', { title: 'Preparedness Analytics', courseCompletions, xpDistribution });
    } catch (error) { res.status(500).send("Could not load analytics data."); }
});

router.get('/admin/courses', async (req, res) => { const courses = await Course.find(); res.render('admin_courses', { title: 'Manage Courses', courses }); });
router.get('/admin/courses/new', (req, res) => { res.render('admin_course_form', { title: 'New Course', course: {} }); });
router.get('/admin/courses/:id', async (req, res) => { const course = await Course.findById(req.params.id).populate('lessons'); res.render('admin_course_detail', { title: 'Edit Course', course }); });
router.get('/admin/drills', async (req, res) => { try { const drills = await Drill.find().sort({ scheduledFor: -1 }); res.render('admin_drills', { title: 'Manage Drills', drills }); } catch (error) { res.status(500).send("Error fetching drills."); } });

// --- Student-Facing Feature Routes ---
router.get('/courses', async (req, res) => { const courses = await Course.find(); res.render('student_courses', { title: 'Courses', courses }); });
router.get('/courses/:id', async (req, res) => { const course = await Course.findById(req.params.id).populate('lessons'); res.render('student_course_detail', { title: course.title, course }); });
router.get('/courses/:courseId/lessons/:lessonId', async (req, res) => { const lesson = await Lesson.findById(req.params.lessonId); const course = await Course.findById(req.params.courseId); const isLastLesson = course.lessons.length > 0 && course.lessons[course.lessons.length - 1].equals(lesson._id); res.render('student_lesson_view', { title: lesson.title, lesson, course, isLastLesson }); });
router.get('/check-kit', (req, res) => { res.render('kit_checker', { title: 'AI Kit Checker', result: null, error: null }); });

// --- THE MISSING ROUTE IS HERE ---
router.get('/leaderboard', async (req, res) => {
    try {
        const topStudents = await User.find({ role: 'student' }).sort({ xp: -1 }).limit(10);
        res.render('leaderboard', { title: 'Leaderboard', students: topStudents });
    } catch (error) {
        res.status(500).send('Error fetching leaderboard data.');
    }
});

// --- API Logic Routes (POST Requests) ---
router.post('/alerts', async (req, res) => { const newAlert = new Alert(req.body); await newAlert.save(); res.redirect('/ddma'); });
router.post('/alerts/delete/:id', async (req, res) => { await Alert.findByIdAndDelete(req.params.id); res.redirect('/ddma'); });
router.post('/ask-ai', async (req, res) => {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required.' });
    
    const model = 'gemini-1.5-flash-latest';
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const prompt = `You are a helpful and concise disaster safety assistant for India. Your primary goal is to provide clear, simple, and actionable safety instructions. Do not give medical advice. Keep answers to a maximum of 3-4 sentences. Answer the following question: "${question}"`;
    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

    try {
        const apiResponse = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
        if (!apiResponse.ok) throw new Error(`API responded with status ${apiResponse.status}`);
        const data = await apiResponse.json();
        const answer = data.candidates[0].content.parts[0].text;
        res.json({ answer: answer.trim() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get an answer from the AI.' });
    }
});
router.post('/check-kit', upload.single('kitImage'), async (req, res) => {
    try {
        if (!req.file) return res.render('kit_checker', { title: 'AI Kit Checker', error: 'Please upload an image.' });
        
        const imagePath = req.file.path;
        const imageBase64 = fs.readFileSync(imagePath).toString('base64');
        
        const model = 'gemini-1.5-flash-latest';
        const apiKey = process.env.GOOGLE_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const prompt = `You are a disaster preparedness expert. Analyze this image of a user's emergency kit. Identify the visible items. Based on standard guidelines for India, provide a simple, bulleted list of: 1. Essential items that are VISIBLY PRESENT. 2. CRITICAL items that appear to be MISSING (like a water bottle, first-aid kit, flashlight, documents, etc.). Be encouraging and concise.`;
        const requestBody = { contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: req.file.mimetype, data: imageBase64 } }] }] };

        const apiResponse = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
        if (!apiResponse.ok) throw new Error(`API responded with status ${apiResponse.status}`);
        
        const data = await apiResponse.json();
        const resultText = data.candidates[0].content.parts[0].text;
        
        fs.unlinkSync(imagePath);
        res.render('kit_checker', { title: 'AI Kit Checker', result: resultText });
    } catch (error) {
        res.render('kit_checker', { title: 'AI Kit Checker', error: 'Sorry, there was an error analyzing your image.' });
    }
});
router.post('/admin/courses/new', async (req, res) => { const course = new Course(req.body); await course.save(); res.redirect('/admin/courses'); });
router.post('/admin/courses/:id/lessons', async (req, res) => { const course = await Course.findById(req.params.id); const lesson = new Lesson({ ...req.body, course: course._id }); await lesson.save(); course.lessons.push(lesson); await course.save(); res.redirect(`/admin/courses/${req.params.id}`); });
router.post('/admin/drills', async (req, res) => { const newDrill = new Drill(req.body); await newDrill.save(); res.redirect('/admin/drills'); });
router.post('/admin/drills/:id/complete', async (req, res) => { await Drill.findByIdAndUpdate(req.params.id, { status: 'Completed' }); res.redirect('/admin/drills'); });
router.post('/admin/drills/:id/delete', async (req, res) => { await Drill.findByIdAndDelete(req.params.id); res.redirect('/admin/drills'); });

// --- Gamification POST Routes ---
router.post('/quiz/complete', async (req, res) => {
    try {
        const { userId, score } = req.body;
        const xpGained = parseInt(score);
        const updatedUser = await User.findByIdAndUpdate(userId, { $inc: { xp: xpGained } }, { new: true });
        if (!updatedUser) return res.status(404).json({ error: 'User not found.' });
        res.json({ success: true, newXp: updatedUser.xp });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update XP.' });
    }
});
router.post('/courses/:id/complete', async (req, res) => {
    const demoUserId = "68ca7e2c77b55d5a050def87"; // Your ID is here
    try {
        const course = await Course.findById(req.params.id);
        const user = await User.findById(demoUserId);
        if (!user || !course) return res.status(404).send('User or Course not found');
        if (user.completedCourses.includes(course._id)) return res.redirect('/courses');
        user.xp += course.xpAward;
        user.completedCourses.push(course);
        await user.save();
        res.redirect('/courses');
    } catch (error) {
        res.status(500).send('Error completing course.');
    }
});

module.exports = router;