const axios = require("axios");

const sendOtpEmail = async (name, email, otp) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "Crowd-Shield",
        email: process.env.EMAIL_USER,
      },
      to: [
        {
          email,
          name,
        },
      ],
      subject: "Confirm your email for Crowd-Shield",
      textContent: `Your OTP is ${otp}`,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
};

module.exports = { sendOtpEmail };