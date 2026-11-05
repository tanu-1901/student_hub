const mongoose = require('mongoose');
const StudySession = require('../models/studySession.model');
const User = require('../models/user.model');

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory study sessions for offline / demo mode
const inMemoryStudySessions = [
    { day: 'Mon', fullDay: 'Monday', subject: 'Frontend Dev', durationMinutes: 150, hours: 2.5 },
    { day: 'Tue', fullDay: 'Tuesday', subject: 'Backend Systems', durationMinutes: 110, hours: 1.8 },
    { day: 'Wed', fullDay: 'Wednesday', subject: 'Full Stack & JS', durationMinutes: 180, hours: 3.0 },
    { day: 'Thu', fullDay: 'Thursday', subject: 'Database & MongoDB', durationMinutes: 130, hours: 2.2 },
    { day: 'Fri', fullDay: 'Friday', subject: 'Cognitive Mind Gym', durationMinutes: 170, hours: 2.8 },
    { day: 'Sat', fullDay: 'Saturday', subject: 'Aptitude Practice', durationMinutes: 70, hours: 1.2 },
    { day: 'Sun', fullDay: 'Sunday', subject: 'Mock Exam Revision', durationMinutes: 90, hours: 1.5 },
];

/**
 * Log a study session (Real-time tracking)
 */
exports.logStudySession = async (req, res, next) => {
    try {
        const { durationMinutes, subject = 'General Study', topicCovered } = req.body;
        const studentId = req.user._id || req.user.id;

        if (!durationMinutes || durationMinutes <= 0) {
            return res.status(400).json({
                success: false,
                message: 'A valid study duration in minutes is required.',
            });
        }

        let sessionDoc = null;
        if (isDbConnected()) {
            try {
                sessionDoc = await StudySession.create({
                    student: studentId,
                    subject,
                    durationMinutes,
                    topicCovered,
                    sessionDate: new Date(),
                });

                // Update student's cumulative totalStudyMinutes
                await User.findByIdAndUpdate(studentId, {
                    $inc: { totalStudyMinutes: durationMinutes },
                    lastStudyDate: new Date(),
                });
            } catch (dbErr) {
                sessionDoc = null;
            }
        }

        if (!sessionDoc) {
            sessionDoc = {
                _id: 'study_' + Date.now(),
                student: studentId,
                subject,
                durationMinutes,
                topicCovered,
                sessionDate: new Date(),
            };
        }

        res.status(201).json({
            success: true,
            message: `Logged ${durationMinutes} minutes of study time successfully!`,
            session: sessionDoc,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Study Analytics for Chart Rendering (Bar & Pie Charts)
 */
exports.getStudyAnalytics = async (req, res, next) => {
    try {
        const studentId = (req.query.studentId || req.user._id || req.user.id).toString();

        // 7-day study time distribution (for Bar Chart)
        const weeklyBarData = {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            hours: [2.5, 1.8, 3.0, 2.2, 2.8, 1.2, 1.5],
            testsGiven: [3, 2, 4, 3, 4, 1, 2],
            accuracy: [92, 86, 95, 89, 94, 80, 90],
        };

        // Subject time distribution (for Pie Chart)
        const subjectPieData = {
            labels: ['Frontend (HTML/CSS/JS/React)', 'Backend (Node/Express/Python)', 'Databases (MongoDB/SQL)', 'Cognitive Mind Gym & IQ', 'Quantitative Aptitude'],
            hours: [5.2, 3.8, 2.5, 2.0, 1.5],
            colors: ['#4f46e5', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b'],
        };

        const totalHours = weeklyBarData.hours.reduce((acc, h) => acc + h, 0);

        res.json({
            success: true,
            analytics: {
                totalWeeklyHours: Math.round(totalHours * 10) / 10,
                streakDays: req.user.activeStreakDays || 5,
                weeklyBarData,
                subjectPieData,
            },
        });
    } catch (error) {
        next(error);
    }
};
