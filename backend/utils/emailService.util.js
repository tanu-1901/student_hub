const createMailerTransporter = require('../config/mailer.config');

/**
 * Send PDF Report to both Student and Parent via SMTP
 * @param {Object} options
 * @param {string} options.studentEmail
 * @param {string} options.parentEmail
 * @param {string} options.studentName
 * @param {Buffer} options.pdfBuffer
 * @param {string} options.fileName
 * @returns {Promise<Object>}
 */
const sendStudentProgressReportEmail = async ({
    studentEmail,
    parentEmail,
    studentName,
    pdfBuffer,
    fileName = 'StudentPro_Academic_Report.pdf',
}) => {
    const transporter = createMailerTransporter();

    // Prepare list of recipients
    const recipients = [];
    if (parentEmail && parentEmail.includes('@')) recipients.push(parentEmail);
    if (studentEmail && studentEmail.includes('@') && !recipients.includes(studentEmail)) recipients.push(studentEmail);

    if (recipients.length === 0) {
        throw new Error('No valid recipient email address found for student or parent.');
    }

    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'StudentPro Academic Portal'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'reports@studentpro.edu'}>`,
        to: recipients.join(', '),
        subject: `📊 Official Student Performance & Progress Report: ${studentName}`,
        text: `Dear Parent & Student,

Please find attached the official StudentPro Academic Performance & Cognitive Progress Report for ${studentName}.

This report contains:
- Complete breakdown of mock test attempts, scores, and accuracy percentages.
- Subject mastery indicators across technical and analytical curricula.
- 7-Day study hour records and consistency streak tracking.
- AI Academic Counselor insights and recommendations for continued learning.

If you have any questions or require personalized academic guidance, please feel free to reach out to the faculty team through the StudentPro Portal.

Warm regards,
StudentPro Academic Evaluation Team
https://studentpro.edu`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 20px; border-radius: 8px; color: #ffffff; text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">StudentPro Academic Portal</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Official Student Performance & Cognitive Progress Report</p>
            </div>
            
            <div style="padding: 20px 0; color: #334155; line-height: 1.6;">
                <p>Dear Parent & Student,</p>
                <p>We are pleased to share the latest comprehensive academic performance report for <strong>${studentName}</strong>.</p>
                
                <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 12px 16px; margin: 15px 0; border-radius: 4px;">
                    <strong>📎 Attached Document:</strong> ${fileName} (Official PDF)<br>
                    <small style="color: #64748b;">Includes detailed test scores, subject accuracy, study hours, and AI counselor notes.</small>
                </div>

                <p>Please open the attached PDF report for full insights.</p>

                <p style="margin-top: 25px; font-size: 13px; color: #64748b;">
                    Best regards,<br>
                    <strong>StudentPro Evaluation Board</strong><br>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:8000'}" style="color: #4f46e5; text-decoration: none;">Visit StudentPro Portal</a>
                </p>
            </div>
        </div>
        `,
        attachments: [
            {
                filename: fileName,
                content: pdfBuffer,
                contentType: 'application/pdf',
            },
        ],
    };

    try {
        console.log(`[SMTP] Attempting to dispatch PDF report to: ${recipients.join(', ')}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP] Report email successfully sent: ${info.messageId}`);
        return {
            success: true,
            messageId: info.messageId,
            recipients,
        };
    } catch (smtpError) {
        console.warn(`[SMTP Warning] Could not deliver email via configured SMTP server: ${smtpError.message}`);
        return {
            success: false,
            warning: 'SMTP dispatch failed or SMTP credentials not configured in backend/.env',
            error: smtpError.message,
            recipients,
            pdfReady: true,
        };
    }
};

module.exports = {
    sendStudentProgressReportEmail,
};
