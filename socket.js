const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

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
      console.log("Joined room:", userId);
    }

    if (role === "admin") {
      socket.join("admins");
      console.log("Joined room: admins");
    }

    socket.on("join-announcement-event", (eventId) => {
      if (!eventId) return;
      socket.join(`announcement:${eventId}`);
      console.log(`Joined room: announcement:${eventId}`);
    });

    socket.on("leave-announcement-event", (eventId) => {
      if (!eventId) return;
      socket.leave(`announcement:${eventId}`);
      console.log(`Left room: announcement:${eventId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
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
