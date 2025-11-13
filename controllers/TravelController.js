const TravelLog = require("../models/TravelLog");

class TravelController {
  // Create
  static async createTravelLog(req, res) {
    try {
      const travelLog = new TravelLog(req.body);
      const saved = await travelLog.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(400).json({ message: "Failed to create travel log", error: err.message });
    }
  }

  // Read all
  static async getAllTravelLogs(_req, res) {
    try {
      const list = await TravelLog.find().sort({ createdAt: -1 });
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch travel logs", error: err.message });
    }
  }

  // Read one
  static async getTravelLogById(req, res) {
    try {
      const item = await TravelLog.findById(req.params.id);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid id", error: err.message });
    }
  }

  // Update
  static async updateTravelLog(req, res) {
    try {
      const updated = await TravelLog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Failed to update", error: err.message });
    }
  }

  // Delete
  static async deleteTravelLog(req, res) {
    try {
      const deleted = await TravelLog.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ message: "Failed to delete", error: err.message });
    }
  }
}

module.exports = TravelController;