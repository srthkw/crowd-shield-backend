const mongoose = require("mongoose");

const orgReqsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    email: { type: String, unique: true, required: true },
    phone: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrgReqs", orgReqsSchema);