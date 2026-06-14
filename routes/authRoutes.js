const express = require("express");
const { login, updateRole, signupInit, verifyOtp, registerEvent, unregisterEvent, cleanupEventSession, getRoleUsers} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup-init", signupInit);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.patch("/makeorg", protect("admin"), updateRole);
router.post("/register-event", protect(), registerEvent);
router.post("/unregister-event", protect(), unregisterEvent);
router.post("/cleanup-event-session", protect(), cleanupEventSession);
router.get("/role-users/:role", protect("admin"), getRoleUsers);

module.exports = router;
