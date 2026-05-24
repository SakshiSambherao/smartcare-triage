const nodemailer = require('nodemailer');
require('dotenv').config();

// Setup the Transporter (The "Post Office")
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Reusable function to send emails
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"SmartCare Hospital" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email Sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('❌ Email Failed: ', error);
    }
};

module.exports = sendEmail;