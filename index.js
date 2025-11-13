const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.get("/", (req, res) => {
  res.send("✅ Backend is working");
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const travelRoutes = require("./routes/travel");
app.use("/api/travel", travelRoutes);
const aiRoutes = require("./routes/ai");
app.use("/api/ai", aiRoutes);
const galleryRoutes = require("./routes/gallery");
app.use("/api/gallery", galleryRoutes);
const reviewRoutes = require("./routes/reviews");
app.use("/api/reviews", reviewRoutes);
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log(`✅ MongoDB connected`))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});