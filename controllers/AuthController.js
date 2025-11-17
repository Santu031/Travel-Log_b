const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Secret key for JWT - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "travellog_jwt_secret_key";

class AuthController {
  // POST /api/auth/register
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;
      
      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      // Return user data and token
      const userResponse = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar
      };
      
      res.status(201).json({ 
        user: userResponse, 
        token,
        message: "User registered successfully!" 
      });
    } catch (err) {
      res.status(500).json({ message: "Error registering user", error: err.message });
    }
  }

  // POST /api/auth/login
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      // Return user data and token
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      };
      
      res.json({ 
        user: userResponse, 
        token,
        message: "Login successful" 
      });
    } catch (err) {
      res.status(500).json({ message: "Error logging in", error: err.message });
    }
  }

  // GET /api/auth/profile - Get user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      };

      res.json({ user: userResponse });
    } catch (err) {
      res.status(500).json({ message: "Error fetching profile", error: err.message });
    }
  }

  // PUT /api/auth/profile - Update user profile including avatar
  static async updateProfile(req, res) {
    try {
      const { name, avatar } = req.body;
      const email = req.user?.email;

      if (!email) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user fields
      if (name) user.name = name;
      if (avatar !== undefined) user.avatar = avatar;

      await user.save();

      // Return updated user data
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      };

      res.json({ 
        user: userResponse, 
        message: "Profile updated successfully" 
      });
    } catch (err) {
      res.status(500).json({ message: "Error updating profile", error: err.message });
    }
  }
}

module.exports = AuthController;