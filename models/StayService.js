const mongoose = require("mongoose");

const stayServiceSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        imageUrl: {
            type: String,
            required: true,
        },

        imagePublicId: {
            type: String,
            required: true,
        },

        contactNumber: {
            type: String,
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
        },

        description: {
            type: String,
            trim: true,
            default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "StayService",
    stayServiceSchema
);