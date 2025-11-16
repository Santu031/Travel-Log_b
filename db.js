import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Ensure dotenv is loaded
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
let cachedDb = null;

const connectDB = async () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  try {
    const db = await mongoose.connect(MONGODB_URI, {
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

export default connectDB;
