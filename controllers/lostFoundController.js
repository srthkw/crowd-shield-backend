const LostFound = require("../models/LostFound");
const { cloudinary } = require("../config/cloudinary");

const getCloudinaryPublicIdFromUrl = (url) => {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const uploadIndex = parsedUrl.pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const pathAfterUpload = parsedUrl.pathname.slice(uploadIndex + "/upload/".length);
    const withoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    const decodedPath = decodeURIComponent(withoutVersion);
    const extensionIndex = decodedPath.lastIndexOf(".");

    return extensionIndex === -1 ? decodedPath : decodedPath.slice(0, extensionIndex);
  } catch (err) {
    return null;
  }
};

const deleteCloudinaryImages = async (record) => {
  const publicIds = [
    ...(record.imagePublicIds || []),
    ...(record.imageUrls || []).map(getCloudinaryPublicIdFromUrl),
  ].filter(Boolean);

  const uniquePublicIds = [...new Set(publicIds)];
  if (uniquePublicIds.length === 0) return [];

  const results = await Promise.allSettled(
    uniquePublicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      })
    )
  );

  return results
    .map((result, index) => ({ result, publicId: uniquePublicIds[index] }))
    .filter(({ result }) => result.status === "rejected");
};

// CREATE lost/found report
exports.createLostFound = async (req, res) => {

  try {
    const { eventId, type, itemName, description, location, phone } = req.body;

    let imageUrls = [];
    let imagePublicIds = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          {
            folder: `crowd-shield/users/${req.user.id}/items`,
          }
        );

        imageUrls.push(result.secure_url);
        imagePublicIds.push(result.public_id);
      }
    }

    const item = await LostFound.create({
      eventId,
      type,
      itemName,
      description,
      location,
      phone,
      imageUrls,
      imagePublicIds,
      reportedBy: req.user.id,
    });

    return res.status(201).json({item});

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

    const failedDeletions = await deleteCloudinaryImages(record);
    if (failedDeletions.length > 0) {
      console.error(
        "Failed to delete LostFound Cloudinary images:",
        failedDeletions.map(({ publicId, result }) => ({
          publicId,
          reason: result.reason?.message || result.reason,
        }))
      );

      return res.status(502).json({
        message: "Failed to delete item images from Cloudinary. Database record was not deleted.",
      });
    }

    await record.deleteOne();
    res.json({ message: "Record and images deleted" });
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
