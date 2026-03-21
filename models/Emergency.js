const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },

  userName: String,
  userPhone: String,

  latitude: Number,
  longitude: Number,

  active: {
    type: Boolean,
    default: true,
  },

  lastUpdated: {
    type: Date,
    default: Date.now,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Emergency", emergencySchema);