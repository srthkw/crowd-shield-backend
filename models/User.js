const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: String,
    email: { type: String, unique: true, required: true },
    phone: String,
    password: String,
    eventRegistered: { type: mongoose.Schema.Types.ObjectId, default: null, ref: "Event" },
    role: { type: String, default: "attendee" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
