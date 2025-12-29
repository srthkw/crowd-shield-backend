const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createLostFound,
  getLostFound,
  updateLostFound,
  deleteLostFound,
  claimLostFound,
  matchCheck,
  getMyLostFound
} = require("../controllers/lostFoundController");

const router = express.Router();

router.post("/", protect(), createLostFound);
router.get("/:eventId", protect(), getLostFound);
router.patch("/:id", protect(), updateLostFound);
router.delete("/:id", protect(), deleteLostFound);
router.patch("/claim/:id", protect(), claimLostFound);
router.post("/match-check", protect(), matchCheck);
router.get("/mine/:eventId", protect(), getMyLostFound);

module.exports = router;
