require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

const sendMail = async (to, subject, html) => {
    const fromName = process.env.APP_NAME || 'My App';
    const mailOptions = {
        from: `${fromName} <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html
    };
    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendMail
};



