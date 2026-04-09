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
const { initSocket, getIO } = require("./socket");

const app = express();

app.use(cors());

app.use(express.json());

connectDB();

const server = http.createServer(app);

// initialize socket
initSocket(server);

// inject io into req
app.use((req, res, next) => {
  req.io = getIO();
  next();
});

app.use("/emergency", emergencyRoutes);

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
