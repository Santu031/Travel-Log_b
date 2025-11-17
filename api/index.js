const connectDB = require('../db');
const app = require('../index.js');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  try {
    // Connect to MongoDB using cached connection
    await connectDB();
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    return res.status(500).json({ error: "DB Connection Failed" });
  }

  console.log(`Request: ${req.method} ${req.url}`);

  // Pass request to Express app
  return app(req, res);
};
