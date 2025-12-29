const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    type: { type: String, enum: ["lost", "found"], required: true },
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    claimed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostFound", lostFoundSchema);
