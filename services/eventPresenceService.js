const Emergency = require("../models/Emergency");
const Event = require("../models/Event");
const User = require("../models/User");

const getUserReportsRoom = (eventId) => `user-reports:${eventId}`;

const emitUserReportsChanged = (io, eventId) => {
  if (!io || !eventId) return;
  io.to(getUserReportsRoom(eventId)).emit("event-users-updated", { eventId });
};

const stopActiveEmergencyForUser = async (io, userId, eventId) => {
  if (!userId || !eventId) return;

  const emergency = await Emergency.findOneAndUpdate(
    { user: userId, event: eventId, active: true },
    { active: false, lastUpdated: new Date() },
    { new: true }
  );

  if (!emergency || !io) return;

  const event = await Event.findById(eventId).select("createdBy");
  const rooms = new Set([event?.createdBy?.toString(), "admins"].filter(Boolean));

  rooms.forEach((room) => {
    io.to(room).emit("emergency-alert", emergency);
  });
};

const unregisterUserFromEvent = async (io, userId, eventId) => {
  if (!userId || !eventId) return;

  const result = await User.updateOne(
    { _id: userId, eventRegistered: eventId },
    { $set: { eventRegistered: null } }
  );

  if (result.modifiedCount > 0) {
    emitUserReportsChanged(io, eventId);
  }
};

const cleanupAttendeeEventSession = async (io, userId, eventId) => {
  await stopActiveEmergencyForUser(io, userId, eventId);
  await unregisterUserFromEvent(io, userId, eventId);
};

module.exports = {
  cleanupAttendeeEventSession,
  emitUserReportsChanged,
  getUserReportsRoom,
  stopActiveEmergencyForUser,
  unregisterUserFromEvent,
};
