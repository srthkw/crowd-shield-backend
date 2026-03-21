const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const { initCloudinary } = require("./config/cloudinary");
initCloudinary();
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");
const orgReqsRoutes = require("./routes/orgReqsRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");

const app = express();

app.use(cors());

app.use(express.json());

connectDB();

const server = http.createServer(app);

// 🔥 Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔥 Inject io into req
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/emergency", emergencyRoutes);

// 🔌 Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.auth.userId;

  if (userId) {
    socket.join(userId);
    console.log("Joined room:", userId);
  }

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use("/lostfound", lostFoundRoutes);

app.use("/announcements", announcementRoutes);

app.use("/events", eventRoutes);

app.use("/org-reqs", orgReqsRoutes);

app.use("/auth", authRoutes);


app.get("/", (req, res) => {
  res.send("Backend is working ✔");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
