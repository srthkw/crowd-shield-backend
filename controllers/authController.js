const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const count = await User.countDocuments();
    const role = count === 0 ? "admin" : "attendee"; // first user becomes admin

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name, email, phone, password: hashedPassword, role
    });

    res.status(201).json({ message: "Signup successful", role: newUser.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token, role: user.role, name: user.name, id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
