const mongoose = require('mongoose');
const app = require('../index.js');

// MongoDB connection for Vercel serverless functions
const MONGO_URI = process.env.MONGO_URI;

// Initialize MongoDB connection unconditionally for Vercel
if (MONGO_URI) {
  // Check if we're already connected
  if (mongoose.connection.readyState === 0) {
    console.log("Attempting to connect to MongoDB in Vercel...");
    mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    })
    .then(() => console.log(`✅ MongoDB connected in Vercel`))
    .catch(err => {
      console.error("❌ MongoDB connection error in Vercel:", err);
      // Don't throw error here as it might crash the serverless function
    });
  } else {
    console.log("✅ MongoDB already connected in Vercel, state:", mongoose.connection.readyState);
  }
} else {
  console.error("❌ MONGO_URI not found in Vercel environment variables");
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Set CORS headers for preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }
  
  // Log the request for debugging
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Pass the request to the Express app
  return app(req, res);
};