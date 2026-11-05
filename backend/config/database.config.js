const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas or local MongoDB instance
 */
const connectDatabase = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studentpro';
        
        console.log(`[Database] Attempting connection to MongoDB Atlas...`);
        
        const connection = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000, // 10s for initial Atlas handshake
        });

        console.log(`[Database] MongoDB Connected Successfully: ${connection.connection.host}/${connection.connection.name}`);
        
        // Seed initial student and teacher demo accounts into MongoDB Atlas if they do not exist
        await seedInitialData();

        return connection;
    } catch (error) {
        console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
        console.warn(`[Database Warning] Running in offline/memory fallback mode. Configure MONGODB_URI in backend/.env with your valid MongoDB Atlas connection string.`);
        return null;
    }
};

const seedInitialData = async () => {
    try {
        const User = require('../models/user.model');
        const studentExists = await User.findOne({ email: 'student@gmail.com' });
        if (!studentExists) {
            console.log('[Database] Auto-seeding default student demo account into MongoDB Atlas...');
            await User.create({
                name: 'Tanu Singh',
                email: 'student@gmail.com',
                password: 'password123',
                role: 'student',
                stream: 'Computer Science',
                classOrYear: '12th Standard',
                section: 'A',
                rollNumber: 'STU-101',
                parentName: 'Mr. R. K. Singh',
                parentMobile: '9876543210',
                parentEmail: 'parent.tanu@gmail.com',
                totalStudyMinutes: 340,
                activeStreakDays: 5,
            });
            console.log(`🎉 [User Registered]: "Tanu Singh" | Email: student@gmail.com | Role: STUDENT | Stream: Computer Science`);
        }

        const teacherExists = await User.findOne({ email: 'teacher@gmail.com' });
        if (!teacherExists) {
            console.log('[Database] Auto-seeding default teacher demo account into MongoDB Atlas...');
            await User.create({
                name: 'Prof. Rajesh Sharma',
                email: 'teacher@gmail.com',
                password: 'password123',
                role: 'teacher',
                department: 'Computer Science & Engineering',
                designation: 'Head of Department (HOD)',
                employeeId: 'TCH-901',
            });
            console.log(`🎉 [User Registered]: "Prof. Rajesh Sharma" | Email: teacher@gmail.com | Role: TEACHER | Dept: Computer Science & Engineering`);
        }
    } catch (err) {
        console.warn('[Database Seed Notice]:', err.message);
    }
};

module.exports = connectDatabase;
