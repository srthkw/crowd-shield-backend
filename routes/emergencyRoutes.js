const express = require("express");
const router = express.Router();
const { startEmergency, getActiveEmergencies, getEmergencyById } = require("../controllers/emergencyController");
const { protect } = require("../middleware/authMiddleware");

router.post("/start", protect("attendee"), startEmergency);
router.get("/active/:eventId", protect("organizer"), getActiveEmergencies);
router.get("/:id", protect("organizer"), getEmergencyById);

module.exports = router;