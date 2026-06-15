const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema({
    email: String,
    otp: Number,
    otpExpiry: Date,
    isVerified: {
      type: Boolean,
      default: false
    }
  });

module.exports = mongoose.model(
  "PasswordReset",
  passwordResetSchema
);