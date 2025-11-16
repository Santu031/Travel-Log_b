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

// Connect to MongoDB - this should work in both local and Vercel environments
const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log(`✅ MongoDB connected`))
    .catch(err => console.error("❌ MongoDB connection error:", err));
} else {
  console.error("❌ MONGO_URI not found in environment variables");
}

app.get("/", (req, res) => {
  res.send("✅ Backend is working");
});

// Add a simple test endpoint to verify routing is working
app.get("/api/test", (req, res) => {
  res.json({ message: "API routing is working correctly" });
});

// Test if routes are being imported correctly
try {
  const authRoutes = require("./routes/auth");
  console.log("Auth routes imported successfully");
  app.use("/api/auth", authRoutes);
} catch (error) {
  console.error("Error importing auth routes:", error);
}

try {
  const travelRoutes = require("./routes/travel");
  console.log("Travel routes imported successfully");
  app.use("/api/travel", travelRoutes);
} catch (error) {
  console.error("Error importing travel routes:", error);
}

try {
  const aiRoutes = require("./routes/ai");
  console.log("AI routes imported successfully");
  app.use("/api/ai", aiRoutes);
} catch (error) {
  console.error("Error importing AI routes:", error);
}

try {
  const galleryRoutes = require("./routes/gallery");
  console.log("Gallery routes imported successfully");
  app.use("/api/gallery", galleryRoutes);
} catch (error) {
  console.error("Error importing gallery routes:", error);
}

try {
  const reviewRoutes = require("./routes/reviews");
  console.log("Review routes imported successfully");
  app.use("/api/reviews", reviewRoutes);
} catch (error) {
  console.error("Error importing review routes:", error);
}

// For Vercel, we need to export the app
module.exports = app;

// Only start the server if this file is run directly (not in Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}