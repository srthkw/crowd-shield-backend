const express = require("express");
const { orgRegister, getOrgReqs } = require("../controllers/OrgReqsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", orgRegister);
router.get("/", protect("admin"), getOrgReqs);

module.exports = router;