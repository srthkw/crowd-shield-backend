const Announcement = require("../models/Announcement");

const toAnnouncementPayload = (announcement) => ({
  ...announcement.toObject(),
  _id: announcement._id.toString(),
  eventId: announcement.eventId.toString(),
  createdBy: announcement.createdBy.toString(),
});

const emitAnnouncementEvent = (req, eventId, eventName, payload) => {
  if (!req.io || !eventId) return;
  req.io.to(`announcement:${eventId}`).emit(eventName, payload);
};

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

    emitAnnouncementEvent(
      req,
      eventId,
      announcement.status === "approved" ? "announcement:approved" : "announcement:pending-created",
      toAnnouncementPayload(announcement)
    );

    res.status(201).json(toAnnouncementPayload(announcement));
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

    emitAnnouncementEvent(req, announcement.eventId, "announcement:approved", toAnnouncementPayload(announcement));
    res.json({ message: "Announcement approved", announcement: toAnnouncementPayload(announcement) });
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
    emitAnnouncementEvent(req, announcement.eventId, "announcement:deleted", {
      _id: announcement._id.toString(),
      eventId: announcement.eventId.toString(),
      status: announcement.status,
    });
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
