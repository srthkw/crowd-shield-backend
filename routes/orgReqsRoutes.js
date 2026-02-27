const express = require("express");
const { orgRegister, getOrgReqs, updateStatus } = require("../controllers/OrgReqsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", orgRegister);
router.get("/", protect("admin"), getOrgReqs);
router.patch("/:id", protect("admin"), updateStatus);

module.exports = router;