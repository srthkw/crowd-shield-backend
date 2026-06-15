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
      textContent: `Dear User,

To proceed with your Crowd-Shield account request, please use the verification code below:

OTP: ${otp}

This code will expire in 5 minutes.

For security reasons, do not share this code with anyone. If you did not request this verification, no further action is required and you may safely ignore this email.

Crowd-Shield is committed to providing secure and reliable services for event safety, emergency response, and attendee assistance.

Regards,
Crowd-Shield Team`,
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