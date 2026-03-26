const Emergency = require("../models/Emergency");
const Event = require("../models/Event");
const User = require("../models/User");

exports.startEmergency = async (req, res) => {
  try {
    const { eventId, latitude, longitude } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const user = await User.findById(req.user.id);

    const emergency = await Emergency.findOneAndUpdate(
      { user: user._id, event: eventId, active: true },
      {
        user: user._id,
        event: eventId,
        userName: user.name,
        userPhone: user.phone,
        latitude,
        longitude,
        lastUpdated: new Date(),
        active: true,
      },
      { upsert: true, new: true }
    );

    const organizerId = event.createdBy.toString();

    // 🔥 SOCKET EMIT
    req.io.to(organizerId).emit("emergency-alert", emergency);

    console.log("Emitting to:", organizerId);
    console.log("Payload:", emergency);

    res.json({ message: "Your location has been shared, organizer will be notified. Please wait for the team to reach you. Do not close or refresh this window", emergency });
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