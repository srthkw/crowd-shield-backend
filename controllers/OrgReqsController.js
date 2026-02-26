const OrgReqs = require("../models/OrgReqs");

exports.getOrgReqs = async (req, res) => {
    try {
      const orgReqs = await OrgReqs.find().sort({ createdAt: -1 });
      res.json(orgReqs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

exports.orgRegister = async (req, res) => {
    try {
      const { userId, name, email, phone } = req.body;
  
      const existing = await OrgReqs.findOne({ email });
      if (existing) return res.status(400).json({ message: "Your previous request is pending, please wait for approval!" });
  
      const newOrg = await OrgReqs.create({
        userId, name, email, phone
      });
  
      res.status(201).json({ message: "Request submitted, please wait for approval" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };