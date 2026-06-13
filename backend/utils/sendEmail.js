const transporter = require('../config/nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;