// utils/sendEmail.js
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Sends an email using Gmail SMTP
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} [html] - Optional HTML body
 * @returns {Promise<void>}
 */
async function sendEmail({ to, subject, text, html }) {
  try {
    console.log()
    const admin=process.env.EMAIL_USER;
    const pass= process.env.EMAIL_APP_PASS;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: admin,
        pass: pass,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw error;
  }
}

async function generateEmailHtml(data, filename) {
const templatePath = path.join(__dirname, '..', 'assets', `${filename}.html`);
  let template = await fs.readFile(templatePath, 'utf8');

  for (const [key, value] of Object.entries(data)) {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }

  return template;
}

module.exports = {
  sendEmail,
  generateEmailHtml,
};
