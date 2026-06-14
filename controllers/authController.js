const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OtpUser = require("../models/OtpUser");
const sendOtpEmail = require("../utils/sendOtpEmail");
const { cleanupAttendeeEventSession, emitUserReportsChanged, unregisterUserFromEvent } = require("../services/eventPresenceService");
const { hasActiveEventSession } = require("../services/activeEventSessions");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

// STEP 1: SEND OTP
exports.signupInit = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const email = normalizeEmail(req.body.email);
    console.log("Signup init data:", req.body);

    if (!name?.trim() || !email || !phone?.trim() || !password) {
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
        name: name.trim(),
        email,
        phone: phone.trim(),
        password: hashedPassword,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000,
      },
      { upsert: true, setDefaultsOnInsert: true }
    );

    try {
      await sendOtpEmail(name, email, otp);
    } catch (err) {
      console.error("SEND OTP EMAIL FAILED:");
      console.error(err);
      throw err;
    }

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// STEP 2: VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await OtpUser.deleteOne({ email });
      return res.status(400).json({ message: "User already exists. Please login." });
    }

    const tempUser = await OtpUser.findOne({ email });

    if (!tempUser) {
      return res.status(400).json({ message: "No OTP request found" });
    }

    if (String(tempUser.otp) !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > tempUser.otpExpiry) {
      await OtpUser.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    const newUser = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password,
      eventRegistered: null,
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
      { id: user._id, role: user.role, name: user.name, email: user.email, phone: user.phone, eventRegistered: user.eventRegistered },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token, role: user.role, name: user.name, email: user.email, id: user._id ,phone: user.phone, eventRegistered: user.eventRegistered});
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

exports.registerEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.eventRegistered = eventId;
    await user.save();
    emitUserReportsChanged(req.io, eventId);
    res.json({ message: "Event registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unregisterEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    await unregisterUserFromEvent(req.io, req.user.id, eventId);
    res.json({ message: "Event unregistered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cleanupEventSession = async (req, res) => {
  try {
    const { eventId } = req.body;
    if (hasActiveEventSession(req.user.id, eventId)) {
      return res.json({ message: "Event session is still active in another tab" });
    }

    await cleanupAttendeeEventSession(req.io, req.user.id, eventId);
    res.json({ message: "Event session cleaned up successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getRoleUsers = async (req, res) => {
  try {
    const { role } = req.body;
    const users = await User.find({ role });
    res.json({ users, message: "Users fetched successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
