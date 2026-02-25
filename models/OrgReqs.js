const mongoose = require("mongoose");

const orgReqsSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: String,
    email: { type: String, unique: true, required: true },
    phone: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrgReqs", orgReqsSchema);