const nodemailer = require('nodemailer');
require('dotenv').config();

// Setup the Transporter (Explicitly configured for Render/Cloud deployment)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Forces SSL/TLS encryption through the firewall
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
        throw error; // Added this so your controller knows if the email fails!
    }
};

module.exports = sendEmail;