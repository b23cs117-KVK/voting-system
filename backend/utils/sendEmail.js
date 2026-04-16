const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  // If no SMTP credentials, log to console for simulation
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.log('-------------------------------------------');
    console.log('SIMULATED EMAIL SEND (SMTP keys missing)');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.text}`);
    console.log('-------------------------------------------');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"PolityConnect" <${SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('SMTP Error:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;
