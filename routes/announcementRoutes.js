const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement
} = require("../controllers/announcementController");

const router = express.Router();

// Create announcement (organizer or admin)
router.post("/", protect(["organizer", "admin"]), createAnnouncement);

// Get announcements for a specific event
router.get("/event/:eventId", protect(), getAnnouncements);

// Delete announcement (creator or admin)
router.delete("/:id", protect(["admin", "organizer"]), deleteAnnouncement);

module.exports = router;
