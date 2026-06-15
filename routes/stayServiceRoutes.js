const express = require("express");

const { createStayService, getStayServices, deleteStayService } = require("../controllers/stayServiceController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.post(
    "/",
    protect(["organizer", "admin"]),
    upload.single("image"),
    createStayService
);

router.get(
    "/:eventId",
    protect(),
    getStayServices
);

router.delete(
    "/:id",
    protect(["organizer", "admin"]),
    deleteStayService
);

module.exports = router;