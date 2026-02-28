const OrgReqs = require("../models/OrgReqs");

exports.getOrgReqs = async (req, res) => {
    try {
      const orgReqs = await OrgReqs.find().sort({ createdAt: -1 });
      res.json(orgReqs.filter(item => item.status === "pending"));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

exports.orgRegister = async (req, res) => {
    try {
      const { userId, name, email, phone } = req.body;
  
      const existing = await OrgReqs.findOne({ email });
      if (existing && existing.status === "pending") return res.status(400).json({ message: "Your previous request is pending, please wait for approval!" });

      if (existing && existing.status === "approved") return res.status(400).json({ message: "Your request has been approved! Please login again to access your dashboard" });

      if (existing && existing.status === "rejected") return res.status(400).json({ message: "Your request has been rejected by the admin" });
  
      if (existing == null) {
      const newOrg = await OrgReqs.create({
        userId, name, email, phone
      });
  
      res.status(201).json({ message: "Request submitted, please wait for approval" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  exports.updateStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await OrgReqs.findByIdAndUpdate(id, { status }, { new: true });
      if (!updated) return res.status(404).json({ message: "Request not found" });
      res.json({ message: "Status updated", request: updated });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };