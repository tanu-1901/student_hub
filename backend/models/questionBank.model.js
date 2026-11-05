const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true,
    },
    options: {
        type: [String],
        required: true,
        validate: [arr => arr.length >= 2, 'At least 2 options are required'],
    },
    correctAnswerIndex: {
        type: Number,
        required: true,
        min: 0,
    },
    explanation: {
        type: String,
        default: '',
    },
});

const questionBankSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            default: 'Technical',
        },
        defaultDurationMinutes: {
            type: Number,
            default: 20,
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Medium',
        },
        questions: [questionSchema],
    },
    {
        timestamps: true,
    }
);

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);
module.exports = QuestionBank;
