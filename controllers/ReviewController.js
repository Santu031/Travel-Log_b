const Review = require("../models/Review");

class ReviewController {
  // Create
  static async createReview(req, res) {
    try {
      const { author, avatar, destination, rating, title, body, date } = req.body;
      
      // Validate required fields
      if (!author || !destination || !rating || !title || !body) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const review = new Review({
        author: req.body.author || "Anonymous",
        avatar: req.body.avatar || null,
        rating: req.body.rating,
        title: req.body.title || "",
        body: req.body.body || "",
        destination: req.body.destination || "",
        date: req.body.date ? new Date(req.body.date) : undefined,
        photos: Array.isArray(req.body.photos) ? req.body.photos : [],
      });
      const saved = await review.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(400).json({ message: "Failed to create review", error: err.message });
    }
  }

  // Read all
  static async getReviews(req, res) {
    try {
      const { destination, rating, sort } = req.query;
      
      // Build query
      const query = {};
      if (destination) {
        query.destination = { $regex: destination, $options: 'i' };
      }
      if (rating) {
        query.rating = { $gte: parseInt(rating) };
      }
      
      // Sort by newest or helpful
      const sortOption = sort === 'helpful' ? { helpful: -1 } : { createdAt: -1 };
      
      const list = await Review.find(query).sort(sortOption);
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
    }
  }

  // Increment helpful
  static async incrementHelpful(req, res) {
    try {
      const updated = await Review.findByIdAndUpdate(
        req.params.id,
        { $inc: { helpful: 1 } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Failed to update helpful", error: err.message });
    }
  }

  // Delete
  static async deleteReview(req, res) {
    try {
      const { id } = req.params;
      
      const deletedReview = await Review.findByIdAndDelete(id);
      
      if (!deletedReview) {
        return res.status(404).json({ message: 'Review not found' });
      }

      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ message: "Failed to delete", error: err.message });
    }
  }
}

module.exports = ReviewController;