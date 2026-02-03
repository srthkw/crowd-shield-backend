const LostFound = require("../models/LostFound");
const { cloudinary } = require("../config/cloudinary");

// CREATE lost/found report
exports.createLostFound = async (req, res) => {

  try {
    const { eventId, type, itemName, description, location, phone } = req.body;

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          {
            folder: `crowd-shield/users/${req.user.id}/items`,
          }
        );

        imageUrls.push(result.secure_url);
      }
    }

    const item = await LostFound.create({
      eventId,
      type,
      itemName,
      description,
      location,
      phone,
      imageUrls, // 👈 stored in MongoDB
      reportedBy: req.user.id,
    });

    return res.status(201).json(item);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET matched items
exports.getMatchedItems = async (req, res) => {
  try {
    
    const { itemName, type } = req.body.item;

    const oppositeType = type === "lost" ? "found" : "lost";

    const matches = await LostFound.find({
      itemName: { $regex: new RegExp(`^${itemName}$`, "i") },
      type: oppositeType,
      eventId: req.params.eventId,
      claimed: false
    }).sort({ createdAt: -1 });

    res.json(matches);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all lost/found records for event
exports.getLostFound = async (req, res) => {
  try {
    const { eventId } = req.params;
    const records = await LostFound.find({
      eventId,
      claimed: false     // ⬅ only show active items
    }).sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE report
exports.updateLostFound = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await LostFound.findById(id);
    if (!record) return res.status(404).json({ message: "Not found" });

    if (req.user.role !== "admin" && record.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await LostFound.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ message: "Record updated", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE report
exports.deleteLostFound = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await LostFound.findById(id);
    if (!record) return res.status(404).json({ message: "Not found" });

    if (req.user.role !== "admin" && record.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await record.deleteOne();
    res.json({ message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.claimLostFound = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await LostFound.findById(id);
    if (!record) return res.status(404).json({ message: "Not found" });

    if (record.claimed) return res.status(400).json({ message: "Already claimed" });

    // Only creator OR admin can claim the item
    if (req.user.role !== "admin" && record.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to claim this item" });
    }

    record.claimed = true;
    await record.save();

    res.json({ message: "Item marked as claimed", item: record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyLostFound = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const items = await LostFound.find({
      eventId,
      reportedBy: userId
    }).sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
