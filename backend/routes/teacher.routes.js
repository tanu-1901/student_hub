const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const authenticateToken = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// All teacher routes require authentication and teacher or admin role
router.use(authenticateToken);
router.use(requireRole('teacher', 'admin'));

router.get('/streams', teacherController.getStreamsOverview);
router.get('/streams/:streamName/students', teacherController.getStudentsByStream);
router.get('/students/:studentId/progress', teacherController.getStudentProgressForTeacher);

module.exports = router;
