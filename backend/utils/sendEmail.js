const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If no SMTP credentials, log to console for simulation
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('-------------------------------------------');
    console.log('SIMULATED EMAIL SEND');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.text}`);
    console.log('-------------------------------------------');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `PolityConnect <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
