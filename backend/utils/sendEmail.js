const axios = require('axios');

const sendEmail = async (options) => {
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;

  console.log('--- EmailJS Key Diagnostic ---');
  console.log('Service ID Length:', EMAILJS_SERVICE_ID?.length || 0);
  console.log('Template ID Length:', EMAILJS_TEMPLATE_ID?.length || 0);
  console.log('Public Key Length:', EMAILJS_PUBLIC_KEY?.length || 0);
  console.log('Private Key Length:', EMAILJS_PRIVATE_KEY?.length || 0);
  console.log('------------------------------');

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
    // Note: 'text' usually contains "Your OTP is 123456"
    // We try to extract only the 6 digits if possible for the template
    const otpMatch = options.text.match(/\d{6}/);
    const otp = otpMatch ? otpMatch[0] : options.text;

    await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: options.to,
        otp: otp,
        message: options.text, // Fallback if they use {{message}}
      },
    });
    console.log(`OTP Email sent via EmailJS to ${options.to}`);
  } catch (error) {
    console.error('EmailJS Error:', error.response?.data || error.message);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = sendEmail;
