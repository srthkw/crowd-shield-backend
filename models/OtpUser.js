const mongoose = require("mongoose");

const otpUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }, // hashed
    role: { type: String, default: "attendee" },
    otp: { type: Number, required: true },
    otpExpiry: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OtpUser", otpUserSchema);