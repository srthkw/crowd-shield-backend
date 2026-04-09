const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OtpUser = require("../models/OtpUser");
const sendOtpEmail = require("../utils/sendOtpEmail");

// STEP 1: SEND OTP
exports.signupInit = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    console.log("Signup init data:", req.body);

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);

    await OtpUser.findOneAndUpdate(
      { email },
      {
        name,
        email,
        phone,
        password: hashedPassword,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
      },
      { upsert: true }
    );

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// STEP 2: VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const tempUser = await OtpUser.findOne({ email });

    if (!tempUser) {
      return res.status(400).json({ message: "No OTP request found" });
    }

    if (tempUser.otp != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > tempUser.otpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const newUser = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password,
      role: "attendee",
    });

    await OtpUser.deleteOne({ email });

    res.json({ message: "Signup successful", role: newUser.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token, role: user.role, name: user.name, email: user.email, id: user._id ,phone: user.phone});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { userId } = req.body.orgReq;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.role = "organizer";
    await user.save();
    res.json({ message: "Role updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

