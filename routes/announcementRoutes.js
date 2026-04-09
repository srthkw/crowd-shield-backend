const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  getApprovedAnnouncements,
  getPendingAnnouncements,
  approveAnnouncement,
} = require("../controllers/announcementController");

const router = express.Router();

// Create announcement (organizer or admin)
router.post("/", protect(), createAnnouncement);

// Get announcements for a specific event
router.get("/event/:eventId", protect(), getAnnouncements);

// Get approved announcements for a specific event (attendees can only see approved)
router.get("/event/approved/:eventId", protect(), getApprovedAnnouncements);

// Get pending announcements for a specific event (organizer/admin only)
router.get("/event/pending/:eventId", protect(["admin", "organizer"]), getPendingAnnouncements);

// Approve announcement (organizer or admin)
router.put("/approve/:id", protect(["admin", "organizer"]), approveAnnouncement);

// Delete announcement (creator or admin)
router.delete("/:id", protect(["admin", "organizer"]), deleteAnnouncement);

module.exports = router;
