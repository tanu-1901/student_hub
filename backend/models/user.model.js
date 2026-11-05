const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'User full name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'User email address is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters long'],
            select: false, // Don't return password in queries by default
        },
        role: {
            type: String,
            enum: ['student', 'teacher', 'admin'],
            default: 'student',
            required: true,
        },

        // ==========================================
        // STUDENT-SPECIFIC FIELDS
        // ==========================================
        stream: {
            type: String,
            default: 'Computer Science',
            trim: true,
        },
        classOrYear: {
            type: String,
            default: '12th Standard',
            trim: true,
        },
        section: {
            type: String,
            default: 'A',
            trim: true,
        },
        rollNumber: {
            type: String,
            trim: true,
            default: function () {
                return this.role === 'student' ? 'STU-' + Math.floor(100 + Math.random() * 900) : undefined;
            },
        },
        parentName: {
            type: String,
            trim: true,
            default: 'Guardian',
        },
        parentMobile: {
            type: String,
            trim: true,
            default: '9876543210',
        },
        parentEmail: {
            type: String,
            lowercase: true,
            trim: true,
            default: 'parent@example.com',
        },
        totalStudyMinutes: {
            type: Number,
            default: 0,
        },
        activeStreakDays: {
            type: Number,
            default: 1,
        },
        lastStudyDate: {
            type: Date,
            default: Date.now,
        },

        // ==========================================
        // TEACHER-SPECIFIC FIELDS
        // ==========================================
        department: {
            type: String,
            default: 'Computer Science & Engineering',
            trim: true,
        },
        designation: {
            type: String,
            default: 'Faculty Instructor',
            trim: true,
        },
        employeeId: {
            type: String,
            default: function () {
                return this.role === 'teacher' ? 'TCH-' + Math.floor(1000 + Math.random() * 9000) : undefined;
            },
        },
    },
    {
        timestamps: true,
        collection: 'users',
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare input password with hashed password (supports demo passwords for student/teacher)
userSchema.methods.comparePassword = async function (enteredPassword) {
    if ((enteredPassword === '123456' || enteredPassword === 'password123') &&
        (this.email === 'student@gmail.com' || this.email === 'teacher@gmail.com')) {
        return true;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
