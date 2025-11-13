const app = require('../index.js');

// Vercel serverless function handler
module.exports = (req, res) => {
  // Set CORS headers for preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }
  
  // Pass the request to the Express app
  return app(req, res);
};