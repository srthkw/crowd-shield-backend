const Announcement = require("../models/Announcement");

// CREATE ANNOUNCEMENT
exports.createAnnouncement = async (req, res) => {
  try {
    const { eventId, eventCreator, message } = req.body;

    const announcement = await Announcement.create({
      eventId,
      message,
      role: req.user.role,
      createdBy: req.user.id,
      status: req.user.role === "admin" || req.user.id === eventCreator ? "approved" : "pending"
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

// GET APPROVED ANNOUNCEMENTS FOR SPECIFIC EVENT
exports.getApprovedAnnouncements = async (req, res) => {
  try {
    const { eventId } = req.params;

    const announcements = await Announcement.find({ eventId, active: true, status: "approved" })
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingAnnouncements = async (req, res) => {
  try {
    const { eventId } = req.params;

    const announcements = await Announcement.find({ eventId, active: true, status: "pending" })
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// APPROVE ANNOUNCEMENT
exports.approveAnnouncement = async (req, res) => {
  try {
    console.log(req.user.role);
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: "Not found" });

    // Only admin or organizer can approve
    if (req.user.role !== "admin" && req.user.role !== "organizer") {
      return res.status(403).json({ message: "Not authorized" });
    }

    announcement.status = "approved";
    await announcement.save();
    res.json({ message: "Announcement approved" });
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
    if (req.user.role !== "admin" && announcement.createdBy.toString() !== req.user.id && req.user.role !== "organizer") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await announcement.deleteOne();
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
