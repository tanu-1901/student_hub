const express = require('express');
const router = express.Router();
const studyController = require('../controllers/study.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.post('/log', authenticateToken, studyController.logStudySession);
router.get('/analytics', authenticateToken, studyController.getStudyAnalytics);

module.exports = router;
