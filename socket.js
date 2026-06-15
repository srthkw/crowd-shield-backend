const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const {
  cleanupAttendeeEventSession,
  getUserReportsRoom,
} = require("./services/eventPresenceService");
const {
  addActiveEventSocket,
  removeActiveEventSocket: removeTrackedActiveEventSocket,
} = require("./services/activeEventSessions");

let io;

const canTrackEventSession = (role) => ["attendee", "organizer", "admin"].includes(role);

const removeActiveEventSocket = async (socket) => {
  const activeEvent = socket.data.activeEvent;
  if (!activeEvent?.userId || !activeEvent?.eventId) return;

  const isLastActiveSocket = removeTrackedActiveEventSocket(
    activeEvent.userId,
    activeEvent.eventId,
    socket.id
  );
  socket.data.activeEvent = null;

  if (isLastActiveSocket) {
    await cleanupAttendeeEventSession(io, activeEvent.userId, activeEvent.eventId);
  }
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {

    const { token, userId: fallbackUserId, role: fallbackRole } = socket.handshake.auth;
    let userId = fallbackUserId;
    let role = fallbackRole;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id || decoded._id || userId;
        role = decoded.role || role;
      } catch (err) {
        console.log("Socket auth failed:", err.message);
        socket.disconnect();
        return;
      }
    }

    if (userId) {
      socket.join(userId);
    }

    if (role === "admin") {
      socket.join("admins");
    }

    socket.on("join-announcement-event", (eventId) => {
      if (!eventId) return;
      socket.join(`announcement:${eventId}`);
    });

    socket.on("leave-announcement-event", (eventId) => {
      if (!eventId) return;
      socket.leave(`announcement:${eventId}`);
    });

    socket.on("join-user-reports-event", (eventId) => {
      if (!eventId) return;
      socket.join(getUserReportsRoom(eventId));
    });

    socket.on("leave-user-reports-event", (eventId) => {
      if (!eventId) return;
      socket.leave(getUserReportsRoom(eventId));
    });

    socket.on("attendee-active-event", async (eventId) => {
      if (!eventId || !userId || !canTrackEventSession(role)) return;

      try {
        await removeActiveEventSocket(socket);
      } catch (err) {
        console.log("Failed to cleanup previous event session:", err.message);
      }

      addActiveEventSocket(userId, eventId, socket.id);
      socket.data.activeEvent = { userId, eventId };
    });

    socket.on("attendee-leave-event", async (eventId) => {
      if (!eventId || socket.data.activeEvent?.eventId !== eventId) return;
      try {
        await removeActiveEventSocket(socket);
      } catch (err) {
        console.log("Failed to cleanup event session:", err.message);
      }
    });

    socket.on("disconnect", async () => {
      try {
        await removeActiveEventSocket(socket);
      } catch (err) {
        console.log("Failed to cleanup disconnected event session:", err.message);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
