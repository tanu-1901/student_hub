const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authenticateToken = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/download-pdf', reportController.downloadStudentPdfReport);
router.post('/send-email', reportController.sendPdfReportToParentAndStudent);

module.exports = router;
