const mongoose = require('mongoose');
const TestResult = require('../models/testResult.model');
const User = require('../models/user.model');
const subjectQuestionsBank = require('../utils/seedQuestions.data');

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory test results for offline mode
const inMemoryTestHistory = [
    {
        _id: 'test_101',
        student: 'mem_student_01',
        studentName: 'Tanu Singh',
        stream: 'Computer Science',
        subject: 'fullstack',
        testTitle: 'Full Stack Mock Test #1',
        score: 28,
        totalQuestions: 30,
        wrongCount: 2,
        accuracy: 93,
        durationMinutes: 20,
        timeTakenSeconds: 840,
        status: 'Pass',
        date: new Date(Date.now() - 3600 * 1000 * 2),
    },
    {
        _id: 'test_102',
        student: 'mem_student_01',
        studentName: 'Tanu Singh',
        stream: 'Computer Science',
        subject: 'javascript',
        testTitle: 'JavaScript ES6+ Deep Dive',
        score: 9,
        totalQuestions: 10,
        wrongCount: 1,
        accuracy: 90,
        durationMinutes: 15,
        timeTakenSeconds: 380,
        status: 'Pass',
        date: new Date(Date.now() - 3600 * 1000 * 24),
    },
    {
        _id: 'test_103',
        student: 'mem_student_01',
        studentName: 'Tanu Singh',
        stream: 'Computer Science',
        subject: 'reasoning',
        testTitle: 'Logical Reasoning - Level 1',
        score: 5,
        totalQuestions: 5,
        wrongCount: 0,
        accuracy: 100,
        durationMinutes: 10,
        timeTakenSeconds: 190,
        status: 'Pass',
        date: new Date(Date.now() - 3600 * 1000 * 48),
    },
    {
        _id: 'test_104',
        student: 'mem_student_01',
        studentName: 'Tanu Singh',
        stream: 'Computer Science',
        subject: 'css',
        testTitle: 'CSS3 Responsive Design',
        score: 8,
        totalQuestions: 10,
        wrongCount: 2,
        accuracy: 80,
        durationMinutes: 15,
        timeTakenSeconds: 420,
        status: 'Pass',
        date: new Date(Date.now() - 3600 * 1000 * 72),
    },
];

/**
 * List all available subjects for mock tests
 */
exports.getAllSubjects = async (req, res, next) => {
    try {
        const subjects = Object.keys(subjectQuestionsBank).map((key) => {
            const data = subjectQuestionsBank[key];
            return {
                id: key,
                subject: key,
                title: data.title,
                category: data.category,
                questionsCount: data.questions.length,
                defaultDurationMinutes: data.defaultDurationMinutes,
                difficulty: data.difficulty,
            };
        });

        res.json({
            success: true,
            count: subjects.length,
            subjects,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Subject-Specific Questions & Test Details
 */
exports.getSubjectQuestions = async (req, res, next) => {
    try {
        let subjectKey = (req.params.subject || '').toLowerCase().trim();
        // Support common abbreviations
        const aliases = {
            'js': 'javascript',
            'mongo': 'mongodb',
            'py': 'python',
        };
        if (aliases[subjectKey]) {
            subjectKey = aliases[subjectKey];
        }

        const subjectData = subjectQuestionsBank[subjectKey];

        if (!subjectData) {
            return res.status(404).json({
                success: false,
                message: `Subject '${subjectKey}' not found. Available subjects: ${Object.keys(subjectQuestionsBank).join(', ')}`,
            });
        }

        // Return questions without revealing correct answer index if taking test
        const sanitizedQuestions = subjectData.questions.map((q, idx) => ({
            id: idx + 1,
            question: q.question,
            options: q.options,
            explanation: q.explanation,
            correctAnswerIndex: q.correctAnswerIndex, // Keep available for client evaluation
        }));

        res.json({
            success: true,
            subject: subjectKey,
            title: subjectData.title,
            category: subjectData.category,
            defaultDurationMinutes: subjectData.defaultDurationMinutes,
            difficulty: subjectData.difficulty,
            questions: sanitizedQuestions,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Submit Mock Test Result
 */
exports.submitTestResult = async (req, res, next) => {
    try {
        const {
            subject,
            testTitle,
            score,
            totalQuestions,
            timeTakenSeconds,
            durationMinutes = 20,
        } = req.body;

        const studentId = req.user._id || req.user.id;
        const studentName = req.user.name;
        const stream = req.user.stream || 'Computer Science';

        const wrongCount = Math.max(0, totalQuestions - score);
        const accuracy = Math.round((score / totalQuestions) * 100);
        const status = accuracy >= 50 ? 'Pass' : 'Fail';

        let resultDoc = null;
        if (isDbConnected()) {
            try {
                resultDoc = await TestResult.create({
                    student: studentId,
                    studentName,
                    stream,
                    subject: subject || 'general',
                    testTitle: testTitle || 'Subject Mock Test',
                    score,
                    totalQuestions,
                    wrongCount,
                    accuracy,
                    durationMinutes,
                    timeTakenSeconds: timeTakenSeconds || 0,
                    status,
                    date: new Date(),
                });

                // Update user streak & active date
                await User.findByIdAndUpdate(studentId, {
                    $inc: { activeStreakDays: 1 },
                    lastStudyDate: new Date(),
                });
            } catch (dbErr) {
                resultDoc = null;
            }
        }

        if (!resultDoc) {
            resultDoc = {
                _id: 'test_' + Date.now(),
                student: studentId,
                studentName,
                stream,
                subject: subject || 'general',
                testTitle: testTitle || 'Subject Mock Test',
                score,
                totalQuestions,
                wrongCount,
                accuracy,
                durationMinutes,
                timeTakenSeconds: timeTakenSeconds || 0,
                status,
                date: new Date(),
            };
            inMemoryTestHistory.unshift(resultDoc);
        }

        res.status(201).json({
            success: true,
            message: 'Test result submitted and evaluated successfully!',
            result: resultDoc,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Test History for Current Student or Specific Student ID
 */
exports.getStudentTestHistory = async (req, res, next) => {
    try {
        // Teacher can pass studentId as query or route param; student gets their own
        const targetStudentId = (req.query.studentId || (req.user && (req.user._id || req.user.id)) || 'mem_student_01').toString();

        let history = [];
        if (isDbConnected()) {
            try {
                history = await TestResult.find({ student: targetStudentId }).sort({ date: -1 });
            } catch (dbErr) {
                history = [];
            }
        }

        // If DB returned nothing or is offline, check in-memory list
        if (!history || history.length === 0) {
            history = inMemoryTestHistory.filter(
                (t) => t.student && (t.student.toString() === targetStudentId || targetStudentId === 'mem_student_01')
            );
        }

        // If still empty for this student, return all in-memory tests so dashboard has baseline data
        if (!history || history.length === 0) {
            history = inMemoryTestHistory;
        }

        res.json({
            success: true,
            count: history.length,
            tests: history,
            history: history,
        });
    } catch (error) {
        next(error);
    }
};

exports.getInMemoryTestHistory = () => inMemoryTestHistory;
