const StayService = require("../models/StayService");
const Event = require("../models/Event");
const { cloudinary } = require("../config/cloudinary");

const createStayService = async (req, res) => {
    try {

        const {
            eventId,
            name,
            contactNumber,
            address,
            price,
            description,
        } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Image is required",
            });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        if (event.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only event creator can add stay services",
            });
        }

        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            {
                folder: `crowd-shield/events/${eventId}/stay-services`,
            }
        );

        const stayService = await StayService.create({
            eventId,
            name,
            imageUrl: result.secure_url,
            imagePublicId: result.public_id,
            contactNumber,
            address,
            price,
            description,
            createdBy: req.user.id,
        });

        return res.status(201).json({
            success: true,
            stayService,
        });

    } catch (error) {

        console.error("CREATE STAY SERVICE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create stay service",
        });
    }
};

const getStayServices = async (req, res) => {
    try {
        const { eventId } = req.params;

        const services = await StayService.find({
            eventId,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            services,
        });
    } catch (error) {
        console.error("GET STAY SERVICES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stay services",
        });
    }
};

const deleteStayService = async (req, res) => {
    try {
        const service = await StayService.findById(
            req.params.id
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        if (
            service.createdBy.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await cloudinary.uploader.destroy(
            service.imagePublicId,
            {
                resource_type: "image",
                invalidate: true,
            }
        );
        
        await service.deleteOne();

        res.status(200).json({
            success: true,
            message: "Service deleted successfully",
        });
    } catch (error) {
        console.error("DELETE STAY SERVICE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete stay service",
        });
    }
};

module.exports = {
    createStayService,
    getStayServices,
    deleteStayService,
};