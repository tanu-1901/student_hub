const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const connectDatabase = require('./config/database.config');
const errorHandler = require('./middleware/error.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const studyRoutes = require('./routes/study.routes');
const teacherRoutes = require('./routes/teacher.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS & Request Logging
app.use(cors({
    origin: '*',
    credentials: true,
}));
app.use(morgan('dev'));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        service: 'StudentPro Fullstack WebApp API',
        status: 'Online',
        timestamp: new Date(),
        nodeVersion: process.version,
    });
});

// Clean response for browser extension probes (prevents 404 spam in dev logs)
app.use('/api/ext', (req, res) => {
    res.status(200).json({ success: true, active: true });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/reports', reportRoutes);

// ============================================================
// SERVE STATIC FRONTEND FILES
// Connects frontend & backend seamlessly for deployment!
// ============================================================
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback for SPA/direct navigation
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API route not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Central Error Handler
app.use(errorHandler);

// Start Server: Connect to Database first, then start listening
const startServer = async () => {
    console.log(`[Server] Initializing database connection...`);
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🚀 StudentPro Server Running at: http://localhost:${PORT}`);
        console.log(`📁 Serving Frontend from: ${frontendPath}`);
        console.log(`📡 API Endpoints Ready at: http://localhost:${PORT}/api/`);
        console.log(`=======================================================`);
    });
};

startServer();
