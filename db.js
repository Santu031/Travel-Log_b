const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Ensure dotenv is loaded
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
let cachedDb = null;

const connectDB = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  try {
    const db = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedDb = db;
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

module.exports = connectDB;