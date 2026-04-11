const nodemailer = require("nodemailer");

const sendOtpEmail = async (name, email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // app password
    },
  });

  await transporter.sendMail({
    from: `"Crowd-Shield" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Confirm your email for Crowd-Shield",
    text: `Hi ${name},

Welcome to Crowd-Shield!

To complete your sign-up, please use the verification code below:
${otp}
This code will expire in 5 minutes.

If you didn’t create an account, you can safely ignore this email.

—

Team Crowd-Shield`,
  });
};

module.exports = sendOtpEmail;