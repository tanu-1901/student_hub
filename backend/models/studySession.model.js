const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.Mixed,
            ref: 'User',
            required: [true, 'Student ID is required for logging study session'],
        },
        subject: {
            type: String,
            required: true,
            default: 'Full Stack Development',
            trim: true,
        },
        durationMinutes: {
            type: Number,
            required: [true, 'Study duration in minutes is required'],
            min: [1, 'Study session must be at least 1 minute'],
        },
        topicCovered: {
            type: String,
            default: 'Self Study & Practice',
            trim: true,
        },
        sessionDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

studySessionSchema.index({ student: 1, sessionDate: -1 });

const StudySession = mongoose.model('StudySession', studySessionSchema);
module.exports = StudySession;
