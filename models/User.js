const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    phone: String,
    password: String,
    role: { type: String, default: "attendee" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
