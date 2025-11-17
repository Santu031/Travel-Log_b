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
    "https://travel-log-f.vercel.app",
    "https://e-commerce-f-8qn1-peyptq5x0.vercel.app",
    "https://*.vercel.app"
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Note: MongoDB connection is now handled in api/index.js for Vercel serverless functions

app.get("/", (req, res) => {
  res.send("✅ Backend is working");
});

// Add a simple test endpoint to verify routing is working
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API routing is working correctly",
    mongoConnectionState: mongoose.connection.readyState
  });
});

// Import and mount routes directly without try/catch blocks
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
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  const MONGO_URI = process.env.MONGO_URI;
  
  // Local development MongoDB connection
  if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
    .then(() => console.log(`✅ MongoDB connected`))
    .catch(err => console.error("❌ MongoDB connection error:", err));
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}