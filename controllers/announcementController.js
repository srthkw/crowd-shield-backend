const Announcement = require("../models/Announcement");

// CREATE ANNOUNCEMENT
exports.createAnnouncement = async (req, res) => {
  try {
    const { eventId, message } = req.body;

    if (req.user.role === "attendee") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const announcement = await Announcement.create({
      eventId,
      message,
      role: req.user.role,
      createdBy: req.user.id
    });

    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ANNOUNCEMENTS FOR SPECIFIC EVENT
exports.getAnnouncements = async (req, res) => {
  try {
    const { eventId } = req.params;

    const announcements = await Announcement.find({ eventId, active: true })
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE ANNOUNCEMENT
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: "Not found" });

    // Only creator or admin can delete
    if (req.user.role !== "admin" && announcement.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await announcement.deleteOne();
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
