const https = require('https');

const sendEmail = async (options) => {
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;

  console.log('--- EmailJS Key Diagnostic ---');
  console.log('Service ID Length:', EMAILJS_SERVICE_ID?.length || 0);
  console.log('Template ID Length:', EMAILJS_TEMPLATE_ID?.length || 0);
  console.log('Public Key Length:', EMAILJS_PUBLIC_KEY?.length || 0);
  console.log('Private Key Length:', EMAILJS_PRIVATE_KEY?.length || 0);
  console.log('------------------------------');

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    console.log('SIMULATED EMAIL SEND (Keys Missing)');
    return;
  }

  const otpMatch = options.text.match(/\d{6}/);
  const otp = otpMatch ? otpMatch[0] : options.text;

  const data = JSON.stringify({
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_PUBLIC_KEY,
    accessToken: EMAILJS_PRIVATE_KEY,
    template_params: {
      to_email: options.to,
      otp: otp,
      message: options.text,
    },
  });

  const requestOptions = {
    hostname: 'api.emailjs.com',
    port: 443,
    path: '/api/v1.0/email/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': `Bearer ${EMAILJS_PRIVATE_KEY}`, // Some strict modes expect it here
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(requestOptions, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`EmailJS Success: ${res.statusCode} ${responseBody}`);
          resolve(responseBody);
        } else {
          console.error(`EmailJS Server Rejected (${res.statusCode}):`, responseBody);
          reject(new Error(responseBody));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Network Error during EmailJS send:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

module.exports = sendEmail;
