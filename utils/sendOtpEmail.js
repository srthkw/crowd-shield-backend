const nodemailer = require("nodemailer");

const sendOtpEmail = async (name, email, otp) => {
  if (!process.env.BREVO_USER || !process.env.BREVO_PASS) {
    throw new Error("Brevo credentials missing");
  }

  console.log("BREVO_USER =", process.env.BREVO_USER);
  console.log("BREVO_PASS exists =", !!process.env.BREVO_PASS);

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS,
    },
  });

  await transporter.verify();
  console.log("Brevo SMTP connected");

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
  console.log("Mail sent");
};

module.exports = sendOtpEmail;
