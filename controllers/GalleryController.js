const User = require("../models/User");
const Photo = require("../models/Photo");
const Friend = require("../models/Friend");
const connectDB = require("../db");

function escapeRegExp(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Helper: get user by email (case-insensitive match to handle legacy mixed-case records)
async function getUserByEmail(email) {
  if (!email) return null;
  const pattern = `^${escapeRegExp((email || '').trim())}$`;
  return User.findOne({ email: { $regex: pattern, $options: 'i' } });
}

// Helper: convert photo to post format
function photoToPost(photo, user) {
  return {
    id: String(photo._id),
    userId: String(photo.user),
    userName: user?.name || 'Unknown User',
    userAvatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`,
    images: [photo.dataUrl],
    title: `Photo from ${user?.name || 'Unknown User'}`,
    caption: photo.caption || 'Shared a travel moment',
    tags: photo.tags && photo.tags.length > 0 ? photo.tags : ['travel', 'photo'],
    location: photo.location || 'Unknown Location',
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 20),
    createdAt: photo.createdAt.toISOString(),
  };
}

class GalleryController {
  // Photos
  static async getPhotos(req, res) {
    try {
      await connectDB();
      const email = (req.query.email || "").toLowerCase();
      const user = await getUserByEmail(email);
      if (!user) return res.json([]);
      const photos = await Photo.find({ user: user._id }).sort({ createdAt: -1 });
      res.json(photos.map(p => ({ id: String(p._id), userId: String(p.user), dataUrl: p.dataUrl, createdAt: p.createdAt })));
    } catch (err) {
      res.status(500).json({ message: "Error fetching photos", error: err.message });
    }
  }

  static async createPhoto(req, res) {
    try {
      await connectDB();
      const { email, dataUrl, caption, location, tags } = req.body || {};
      if (!email || !dataUrl) return res.status(400).json({ message: "email and dataUrl required" });
      const user = await getUserByEmail(email);
      if (!user) return res.status(400).json({ message: "User not found" });
      const photo = await Photo.create({ 
        user: user._id, 
        dataUrl,
        caption: caption || "",
        location: location || "",
        tags: Array.isArray(tags) ? tags : []
      });
      res.json({ 
        id: String(photo._id), 
        userId: String(photo.user), 
        dataUrl: photo.dataUrl, 
        caption: photo.caption,
        location: photo.location,
        tags: photo.tags,
        createdAt: photo.createdAt 
      });
    } catch (err) {
      res.status(500).json({ message: "Error saving photo", error: err.message });
    }
  }

  static async deletePhoto(req, res) {
    try {
      await connectDB();
      const id = req.params.id;
      await Photo.deleteOne({ _id: id });
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting photo", error: err.message });
    }
  }

  // Posts (photos formatted as posts)
  static async getPosts(req, res) {
    try {
      await connectDB();
      // Get all photos with their users
      const photos = await Photo.find().sort({ createdAt: -1 }).populate('user');
      const posts = photos.map(photo => photoToPost(photo, photo.user));
      res.json(posts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      res.status(500).json({ message: "Error fetching posts", error: err.message });
    }
  }

  static async getTrendingPosts(req, res) {
    try {
      await connectDB();
      // Get recent photos with their users
      const photos = await Photo.find().sort({ createdAt: -1 }).limit(10).populate('user');
      const posts = photos.map(photo => photoToPost(photo, photo.user));
      res.json(posts);
    } catch (err) {
      console.error("Error fetching trending posts:", err);
      res.status(500).json({ message: "Error fetching trending posts", error: err.message });
    }
  }

  // Friends
  static async getFriends(req, res) {
    try {
      await connectDB();
      const email = (req.query.email || "").toLowerCase();
      const user = await getUserByEmail(email);
      if (!user) return res.json([]);
      const friends = await Friend.find({ user: user._id }).populate('friend');
      res.json(friends.map(f => ({ id: String(f._id), friendEmail: f.friend.email, friendName: f.friend.name })));
    } catch (err) {
      res.status(500).json({ message: "Error fetching friends", error: err.message });
    }
  }

  static async addFriend(req, res) {
    try {
      await connectDB();
      const { email, friendEmail } = req.body || {};
      if (!email || !friendEmail) return res.status(400).json({ message: "email and friendEmail required" });
      const user = await getUserByEmail(email);
      const friendUser = await getUserByEmail(friendEmail);
      if (!user || !friendUser) return res.status(400).json({ message: "Both users must be registered" });
      const link = await Friend.findOneAndUpdate(
        { user: user._id, friend: friendUser._id },
        { user: user._id, friend: friendUser._id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      res.json({ id: String(link._id), friendEmail: friendUser.email, friendName: friendUser.name });
    } catch (err) {
      res.status(500).json({ message: "Error adding friend", error: err.message });
    }
  }

  static async removeFriend(req, res) {
    try {
      await connectDB();
      const { email, friendEmail } = req.body || {};
      const user = await getUserByEmail(email);
      const friendUser = await getUserByEmail(friendEmail);
      if (!user || !friendUser) return res.json({ message: "Ok" });
      await Friend.deleteOne({ user: user._id, friend: friendUser._id });
      res.json({ message: "Removed" });
    } catch (err) {
      res.status(500).json({ message: "Error removing friend", error: err.message });
    }
  }

  // Friend profile (with photos)
  static async getFriendProfile(req, res) {
    try {
      await connectDB();
      const email = (req.query.email || "").toLowerCase();
      const user = await getUserByEmail(email);
      if (!user) return res.status(404).json({ message: "User not found" });
      const photos = await Photo.find({ user: user._id }).sort({ createdAt: -1 });
      res.json({
        email: user.email,
        name: user.name,
        photos: photos.map(p => ({ id: String(p._id), dataUrl: p.dataUrl, createdAt: p.createdAt }))
      });
    } catch (err) {
      res.status(500).json({ message: "Error fetching profile", error: err.message });
    }
  }

  // Health check
  static healthCheck(req, res) {
    res.json({ ok: true });
  }

  // Get all users for search functionality
  static async getAllUsers(req, res) {
    try {
      await connectDB();
      const { search } = req.query;
      let query = {};
      
      // If search query is provided, search by name or email
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        };
      }
      
      // Get all users (excluding password field)
      const users = await User.find(query).select('-password').limit(20);
      
      res.json(users.map(user => ({
        id: String(user._id),
        name: user.name,
        email: user.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
      })));
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Error fetching users", error: err.message });
    }
  }
}

module.exports = GalleryController;