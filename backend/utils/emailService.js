const nodemailer = require('nodemailer');

/**
 * Creates a configured nodemailer transporter.
 * If SMTP credentials are provided in env, it uses them.
 * Otherwise, it automatically creates a test Ethereal account.
 */
async function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback for local development using Ethereal
  console.log('No SMTP config found. Creating Ethereal test account...');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

/**
 * Sends an email using the configured transporter.
 */
async function sendEmail({ to, subject, html }) {
  try {
    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
      from: '"TransitOps System" <noreply@transitops.com>',
      to: to || process.env.ALERT_RECIPIENT_EMAIL || 'admin@transitops.com',
      subject,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    
    // If using Ethereal, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Preview URL: ${previewUrl}`);
    }

    return info;
  } catch (error) {
    console.error('Error sending email via SMTP. Falling back to local file export...');
    const fs = require('fs');
    const path = require('path');
    const outDir = path.join(__dirname, '../../brain'); // Try to save in brain folder if exists
    const filename = `email-fallback-${Date.now()}.html`;
    try {
      fs.writeFileSync(filename, html);
      console.log(`Email saved locally to: ${filename}`);
    } catch(e) {
      console.error('Failed to save email locally:', e);
    }
    return null;
  }
}

module.exports = {
  sendEmail
};
