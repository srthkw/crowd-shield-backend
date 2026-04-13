const express = require("express");
const router = express.Router();
const { toggleEmergency, getActiveEmergencies, getEmergencyById, deleteEmergency } = require("../controllers/emergencyController");
const { protect } = require("../middleware/authMiddleware");

router.post("/toggle", protect("attendee", "organizer"), toggleEmergency);
router.delete("/:id", protect("organizer"), deleteEmergency);
router.get("/active/:eventId", protect("organizer"), getActiveEmergencies);
router.get("/:id", protect("organizer"), getEmergencyById);

module.exports = router;