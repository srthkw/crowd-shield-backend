const Event = require("../models/Event");

// Create Event (Organizer Only)
exports.createEvent = async (req, res) => {
  try {
    const { name, location, date, description } = req.body;

    if (req.user.role !== "organizer" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only organizers can create events" });
    }

    const event = await Event.create({
      name,
      location,
      date,
      description,
      createdBy: req.user.id
    });

    res.status(201).json({ message: "Event created", event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Create Bulk Events
exports.createEventsBulk = async (req, res) => {
  try {
    if (req.user.role !== "organizer" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only organizers can create events" });
    }

    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: "Expected an array of events" });
    }

    const eventsWithOwner = req.body.map(event => ({
      ...event,
      createdBy: req.user.id
    }));

    const events = await Event.insertMany(eventsWithOwner);

    res.status(201).json({
      message: "Events created successfully",
      count: events.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Fetch All Events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch Only My Events (Organizer Only)
exports.getMyEvents = async (req, res) => {
  try {
    if (req.user.role !== "organizer" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const events = await Event.find({ createdBy: req.user.id });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({ message: "Event updated", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.createdBy.toString() !== req.user.id || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
