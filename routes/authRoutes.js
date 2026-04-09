const express = require("express");
const { login, updateRole, signupInit, verifyOtp,} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup-init", signupInit);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.patch("/makeorg", protect("admin"), updateRole);

module.exports = router;
