const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer SMTP Transporter
 */
const createMailerTransporter = () => {
    const user = (process.env.SMTP_USER || '').trim();
    // Google App Passwords are shown as 4 chunks with spaces (e.g. "fink qqil txli uadn").
    // Stripping all whitespace gives the exact 16-character secret expected by Gmail SMTP.
    const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

    const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || user.endsWith('@gmail.com');

    if (isGmail) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user,
                pass,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT, 10) || 587;
    const secure = process.env.SMTP_SECURE === 'true';

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: {
            rejectUnauthorized: false,
        },
    });
};

module.exports = createMailerTransporter;
