const express = require("express");
const { signup, login, updateRole} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.patch("/makeorg", protect("admin"), updateRole);

module.exports = router;
