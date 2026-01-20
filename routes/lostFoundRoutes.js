const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { verifyJWT } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  createLostFound,
  getLostFound,
  updateLostFound,
  deleteLostFound,
  claimLostFound,
  getMyLostFound,
  getMatchedItems
} = require("../controllers/lostFoundController");

const router = express.Router();

router.post("/", protect(), verifyJWT, upload.array("image", 5), createLostFound);
router.post("/matches/:eventId", protect(), getMatchedItems);
router.get("/:eventId", protect(), getLostFound);
router.patch("/:id", protect(), updateLostFound);
router.delete("/:id", protect(), deleteLostFound);
router.patch("/claim/:id", protect(), claimLostFound);
router.get("/mine/:eventId", protect(), getMyLostFound);

module.exports = router;
