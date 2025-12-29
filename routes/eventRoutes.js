const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createEvent,
  getEvents,
  getMyEvents,
  updateEvent,
  deleteEvent,
  getEventById
} = require("../controllers/eventController");

const router = express.Router();

router.post("/", protect(["organizer", "admin"]), createEvent);
router.get("/", protect(), getEvents);
router.get("/mine", protect(["organizer", "admin"]), getMyEvents);
router.get("/:id", protect(), getEventById);
router.patch("/:id", protect(["organizer", "admin"]), updateEvent);
router.delete("/:id", protect(["organizer", "admin"]), deleteEvent);

module.exports = router;
