const Emergency = require("../models/Emergency");
const Event = require("../models/Event");
const User = require("../models/User");

exports.toggleEmergency = async (req, res) => {
  try {
    const { eventId, latitude, longitude, active } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const user = await User.findById(req.user.id);

    const emergency = await Emergency.findOneAndUpdate(
      { user: user._id, event: eventId },
      {
        user: user._id,
        event: eventId,
        userName: user.name,
        userPhone: user.phone,
        latitude,
        longitude,
        lastUpdated: new Date(),
        active: active,
      },
      { upsert: true, new: true }
    );

    const rooms = new Set([event.createdBy.toString(), "admins"]);

    rooms.forEach((room) => {
      req.io.to(room).emit("emergency-alert", emergency);
    });

    res.json({ message: active ? "Emergency started" : "Emergency stopped", emergency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id).populate("event");
    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    const eventCreator = emergency.event?.createdBy?.toString();
    const deletedEmergency = emergency.toObject();
    deletedEmergency.active = false;
    deletedEmergency.event = emergency.event?._id || emergency.event;

    await Emergency.findByIdAndDelete(req.params.id);

    new Set([eventCreator, "admins"].filter(Boolean)).forEach((room) => {
      req.io.to(room).emit("emergency-alert", deletedEmergency);
    });

    res.json({ message: "Emergency deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveEmergencies = async (req, res) => {
  try {
    const { eventId } = req.params;

    const emergencies = await Emergency.find({
      event: eventId,
      active: true,
    }).sort({ lastUpdated: -1 });

    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    res.json(emergency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
