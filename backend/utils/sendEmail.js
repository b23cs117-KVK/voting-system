const emailjs = require('@emailjs/nodejs');

const sendEmail = async (options) => {
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;

  // Key Diagnostic (still helpful)
  console.log('--- EmailJS Key Diagnostic ---');
  console.log('Service ID Length:', EMAILJS_SERVICE_ID?.length || 0);
  console.log('Template ID Length:', EMAILJS_TEMPLATE_ID?.length || 0);
  console.log('Public Key Length:', EMAILJS_PUBLIC_KEY?.length || 0);
  console.log('Private Key Length:', EMAILJS_PRIVATE_KEY?.length || 0);

  // If any EmailJS credentials are empty or missing, log to console for simulation
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    console.log('-------------------------------------------');
    console.log('SIMULATED EMAIL SEND (EmailJS keys missing)');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`OTP Content: ${options.text}`);
    console.log('-------------------------------------------');
    return;
  }

  try {
    // Extract OTP for the template
    const otpMatch = options.text.match(/\d{6}/);
    const otp = otpMatch ? otpMatch[0] : options.text;

    // Initialize with keys
    emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY,
      privateKey: EMAILJS_PRIVATE_KEY,
    });

    const templateParams = {
      to_email: options.to,
      otp: otp,
      message: options.text,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('EmailJS Success:', response.status, response.text);
    console.log(`OTP Email sent via @emailjs/nodejs to ${options.to}`);
  } catch (error) {
    console.error('EmailJS Official Library Error:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = sendEmail;
