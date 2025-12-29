const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

connectDB();
app.use("/lostfound", lostFoundRoutes);

app.use("/announcements", announcementRoutes);

app.use("/events", eventRoutes);

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend is working ✔");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
