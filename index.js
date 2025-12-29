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

const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173",
  "http://localhost:4173",
  "https://crowd-shield-v1.vercel.app/"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked: origin not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

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
