const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user.model');

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory fallback if MongoDB Atlas is not yet connected
const inMemoryUsers = [
    {
        _id: 'mem_student_01',
        id: 'mem_student_01',
        name: 'Tanu Singh',
        email: 'student@gmail.com',
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
    },
    {
        _id: 'mem_student_02',
        id: 'mem_student_02',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        role: 'student',
        stream: 'Information Technology',
        classOrYear: '3rd Year B.Tech',
        section: 'B',
        rollNumber: 'IT-204',
        parentName: 'Mrs. S. Sharma',
        parentMobile: '9812345678',
        parentEmail: 'parent.rahul@example.com',
        totalStudyMinutes: 280,
        activeStreakDays: 4,
    },
    {
        _id: 'mem_student_03',
        id: 'mem_student_03',
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        role: 'student',
        stream: 'Electronics & Communication',
        classOrYear: 'Final Year B.Tech',
        section: 'A',
        rollNumber: 'ECE-315',
        parentName: 'Mr. V. Patel',
        parentMobile: '9845612300',
        parentEmail: 'parent.priya@example.com',
        totalStudyMinutes: 420,
        activeStreakDays: 7,
    },
    {
        _id: 'mem_student_04',
        id: 'mem_student_04',
        name: 'Aman Verma',
        email: 'aman.verma@example.com',
        role: 'student',
        stream: 'Mechanical Engineering',
        classOrYear: '2nd Year B.Tech',
        section: 'A',
        rollNumber: 'MECH-102',
        parentName: 'Mr. D. Verma',
        parentMobile: '9899887766',
        parentEmail: 'parent.aman@example.com',
        totalStudyMinutes: 190,
        activeStreakDays: 3,
    },
    {
        _id: 'mem_student_05',
        id: 'mem_student_05',
        name: 'Neha Gupta',
        email: 'neha.gupta@example.com',
        role: 'student',
        stream: 'Civil Engineering',
        classOrYear: '3rd Year B.Tech',
        section: 'C',
        rollNumber: 'CIVIL-401',
        parentName: 'Mrs. K. Gupta',
        parentMobile: '9711223344',
        parentEmail: 'parent.neha@example.com',
        totalStudyMinutes: 310,
        activeStreakDays: 6,
    },
    {
        _id: 'mem_teacher_01',
        id: 'mem_teacher_01',
        name: 'Prof. Rajesh Sharma',
        email: 'teacher@gmail.com',
        role: 'teacher',
        department: 'Computer Science & Engineering',
        designation: 'Head of Department (HOD)',
        employeeId: 'TCH-901',
    },
];

/**
 * Generate JWT Token helper
 */
const generateToken = (user) => {
    const payload = {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        stream: user.stream || 'Computer Science',
        rollNumber: user.rollNumber || 'STU-101',
        parentEmail: user.parentEmail || '',
        parentMobile: user.parentMobile || '',
    };
    const secret = process.env.JWT_SECRET || 'studentpro_super_secure_jwt_secret_key_2026_xyz';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Register a new User (Student or Teacher)
 */
exports.registerUser = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            role = 'student',
            stream,
            classOrYear,
            rollNumber,
            parentName,
            parentMobile,
            parentEmail,
            department,
            designation,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required fields.',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // For student registration, parent mobile & email are required
        if (role === 'student') {
            if (!parentMobile || !parentEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Parent Mobile Number and Parent Email ID are required for student registration so reports can be shared.',
                });
            }
        }

        const dbConnected = isDbConnected();

        if (dbConnected) {
            // Check if user already exists in MongoDB Atlas
            const existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: `An account with email '${normalizedEmail}' already exists in MongoDB. Please log in.`,
                });
            }

            try {
                // Build document tailored specifically according to role
                const userDoc = {
                    name: name.trim(),
                    email: normalizedEmail,
                    password,
                    role: role || 'student',
                };

                if (role === 'teacher') {
                    userDoc.department = department ? department.trim() : 'Computer Science & Engineering';
                    userDoc.designation = designation ? designation.trim() : 'Faculty Instructor';
                    userDoc.employeeId = 'TCH-' + Math.floor(1000 + Math.random() * 9000);
                } else {
                    userDoc.stream = stream ? stream.trim() : 'Computer Science';
                    userDoc.classOrYear = classOrYear ? classOrYear.trim() : '12th Standard';
                    userDoc.rollNumber = rollNumber ? rollNumber.trim() : ('STU-' + Math.floor(100 + Math.random() * 900));
                    userDoc.parentName = parentName ? parentName.trim() : 'Guardian';
                    userDoc.parentMobile = parentMobile ? parentMobile.trim() : '9876543210';
                    userDoc.parentEmail = parentEmail ? parentEmail.trim().toLowerCase() : 'parent@example.com';
                    userDoc.totalStudyMinutes = 0;
                    userDoc.activeStreakDays = 1;
                }

                // Explicitly save directly into MongoDB Atlas
                const newUser = await User.create(userDoc);
                const token = generateToken(newUser);

                // Prominent console logs verifying MongoDB Atlas persistence
                console.log(`\n======================================================`);
                console.log(`✅ [MongoDB Atlas Saved]: User "${newUser.name}" created in "users" collection!`);
                console.log(`   Database Name : ${mongoose.connection.name}`);
                console.log(`   Document ID   : ${newUser._id}`);
                console.log(`   Full Name     : ${newUser.name}`);
                console.log(`   Email         : ${newUser.email}`);
                console.log(`   Role          : ${newUser.role.toUpperCase()}`);
                if (newUser.role === 'student') {
                    console.log(`   Stream        : ${newUser.stream} | Class: ${newUser.classOrYear} | Roll: ${newUser.rollNumber}`);
                    console.log(`   Parent Mobile : ${newUser.parentMobile} | Parent Email: ${newUser.parentEmail}`);
                } else {
                    console.log(`   Department    : ${newUser.department} | Designation: ${newUser.designation}`);
                }
                console.log(`🎉 [User Registered]: "${newUser.name}" | Email: ${newUser.email} | Role: ${newUser.role.toUpperCase()}`);
                console.log(`======================================================\n`);

                return res.status(201).json({
                    success: true,
                    message: 'Account registered and saved successfully in MongoDB Atlas!',
                    token,
                    user: {
                        id: newUser._id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role,
                        stream: newUser.stream,
                        rollNumber: newUser.rollNumber,
                        classOrYear: newUser.classOrYear,
                        parentMobile: newUser.parentMobile,
                        parentEmail: newUser.parentEmail,
                        department: newUser.department,
                        designation: newUser.designation,
                        employeeId: newUser.employeeId,
                    },
                });
            } catch (mongoErr) {
                console.error(`\n❌ [MongoDB Atlas Save Failed]:`, mongoErr.message);
                if (mongoErr.code === 11000) {
                    return res.status(400).json({
                        success: false,
                        message: `An account with this email address (${normalizedEmail}) already exists. Please log in.`,
                    });
                }
                if (mongoErr.name === 'ValidationError') {
                    return res.status(400).json({
                        success: false,
                        message: `Validation Error: ${mongoErr.message}`,
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: `Database Error: Failed to save user into MongoDB Atlas. ${mongoErr.message}`,
                });
            }
        }

        // Memory fallback ONLY if MongoDB connection is offline
        console.warn(`\n⚠️ [Database Notice]: MongoDB Atlas offline (readyState=${mongoose.connection.readyState}). Using in-memory fallback.`);
        const existingMemUser = inMemoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
        if (existingMemUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email address already exists. Please log in.',
            });
        }

        const memUser = {
            _id: 'mem_' + Date.now(),
            id: 'mem_' + Date.now(),
            name,
            email: normalizedEmail,
            role,
            stream: stream || 'Computer Science',
            classOrYear: classOrYear || '12th Standard',
            rollNumber: rollNumber || 'STU-' + Math.floor(100 + Math.random() * 900),
            parentName: parentName || 'Guardian',
            parentMobile: parentMobile || '9876543210',
            parentEmail: parentEmail || 'parent@example.com',
            department: department || 'Engineering',
            designation: designation || 'Faculty Instructor',
            totalStudyMinutes: 0,
            activeStreakDays: 1,
        };

        inMemoryUsers.push(memUser);
        const token = generateToken(memUser);

        console.log(`\n🎉 [User Registered (In-Memory)]: "${memUser.name}" | Email: ${memUser.email} | Role: ${memUser.role.toUpperCase()}`);

        return res.status(201).json({
            success: true,
            message: 'Account registered (Session created in memory mode)!',
            token,
            user: memUser,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Log In User (Student or Teacher)
 */
exports.loginUser = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password.',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 1. Try DB first if connected
        let user = null;
        if (isDbConnected()) {
            try {
                user = await User.findOne({ email: normalizedEmail }).select('+password');
            } catch (dbErr) {
                user = null;
            }
        }

        if (user) {
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials. Please verify your password.',
                });
            }

            // Check role match if specified
            if (role && user.role !== role) {
                return res.status(403).json({
                    success: false,
                    message: `Account role mismatch. This account is registered as '${user.role}', not '${role}'.`,
                });
            }

            const token = generateToken(user);
            console.log(`\n🔑 [User Logged In]: "${user.name}" | Email: ${user.email} | Role: ${user.role.toUpperCase()}`);
            return res.json({
                success: true,
                message: 'Logged in successfully!',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    stream: user.stream,
                    rollNumber: user.rollNumber,
                    classOrYear: user.classOrYear,
                    parentMobile: user.parentMobile,
                    parentEmail: user.parentEmail,
                    department: user.department,
                    designation: user.designation,
                },
            });
        }

        // 2. Demo & In-Memory fallback accounts
        const memUser = inMemoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
        if (memUser) {
            // Check role match
            if (role && memUser.role !== role) {
                return res.status(403).json({
                    success: false,
                    message: `Account role mismatch. This account is registered as '${memUser.role}', not '${role}'.`,
                });
            }

            // For demo users, check password: 'password', '123456', or entered
            if (password === '123456' || password === 'password123' || password.length >= 6) {
                const token = generateToken(memUser);
                console.log(`\n🔑 [User Logged In]: "${memUser.name}" | Email: ${memUser.email} | Role: ${memUser.role.toUpperCase()}`);
                return res.json({
                    success: true,
                    message: 'Demo login successful!',
                    token,
                    user: memUser,
                });
            }
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid email or password. Use demo credentials or register.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Current Logged-in User Profile
 */
exports.getCurrentUserProfile = async (req, res, next) => {
    try {
        return res.json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Export inMemoryUsers for other controllers when DB is running in offline mode
 */
exports.getInMemoryUsers = () => inMemoryUsers;
