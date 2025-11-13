const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Configure CORS for Vercel deployment
const corsOptions = {
  origin: [
    "http://localhost:8081",
    "http://localhost:8080",
    "http://localhost:3000",
    "https://travel-log-f.vercel.app",  // Explicitly allow your frontend
    "https://*.vercel.app"  // Allow all Vercel deployments (fallback)
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.get("/", (req, res) => {
  res.send("✅ Backend is working");
});

// Add a simple test endpoint to verify routing is working
app.get("/api/test", (req, res) => {
  res.json({ message: "API routing is working correctly" });
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

// For Vercel, we need to export the app
module.exports = app;

// Only start the server if this file is run directly (not in Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  const MONGO_URI = process.env.MONGO_URI;
  
  mongoose.connect(MONGO_URI)
    .then(() => console.log(`✅ MongoDB connected`))
    .catch(err => console.error("❌ MongoDB connection error:", err));
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}