const OrgReqs = require("../models/OrgReqs");

exports.orgRegister = async (req, res) => {
    try {
      const { name, email, phone } = req.body;
  
      const existing = await OrgReqs.findOne({ email });
      if (existing) return res.status(400).json({ message: "Your previous request is pending, please wait for approval!" });
  
      const newOrg = await OrgReqs.create({
        name, email, phone
      });
  
      res.status(201).json({ message: "Request submitted, please wait for approval" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };