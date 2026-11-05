const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.get('/subjects', testController.getAllSubjects);
router.get('/subjects/:subject', testController.getSubjectQuestions);
router.post('/submit', authenticateToken, testController.submitTestResult);
router.get('/history', authenticateToken, testController.getStudentTestHistory);

module.exports = router;
