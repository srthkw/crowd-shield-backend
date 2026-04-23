const express = require("express");
const router = express.Router();
const { toggleEmergency, getActiveEmergencies, getEmergencyById, deleteEmergency } = require("../controllers/emergencyController");
const { protect } = require("../middleware/authMiddleware");

router.post("/toggle", protect(), toggleEmergency);
router.delete("/:id", protect(["organizer" , "admin"]), deleteEmergency);
router.get("/active/:eventId", protect(["organizer", "admin"]), getActiveEmergencies);
router.get("/:id", protect(["organizer" , "admin"]), getEmergencyById);

module.exports = router;