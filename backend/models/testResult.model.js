const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.Mixed,
            ref: 'User',
            required: [true, 'Student reference is required for test result'],
        },
        studentName: {
            type: String,
            required: true,
            trim: true,
        },
        stream: {
            type: String,
            default: 'Computer Science',
        },
        subject: {
            type: String,
            required: [true, 'Test subject is required'],
            lowercase: true,
            trim: true,
        },
        testTitle: {
            type: String,
            required: [true, 'Test title is required'],
            trim: true,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
        },
        totalQuestions: {
            type: Number,
            required: true,
            min: 1,
        },
        wrongCount: {
            type: Number,
            default: 0,
        },
        accuracy: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        durationMinutes: {
            type: Number,
            default: 20,
        },
        timeTakenSeconds: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['Pass', 'Fail'],
            default: 'Pass',
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast query of student's tests
testResultSchema.index({ student: 1, date: -1 });

const TestResult = mongoose.model('TestResult', testResultSchema);
module.exports = TestResult;
