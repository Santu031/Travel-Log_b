const TravelLog = require("../models/TravelLog");

class TravelController {
  // Create
  static async createTravelLog(req, res) {
    try {
      const { title, description, location, startDate, endDate, photos } = req.body;
      
      // Validate required fields
      if (!title || !description || !location) {
        return res.status(400).json({ message: 'Title, description, and location are required' });
      }

      const travelLog = new TravelLog(req.body);
      const saved = await travelLog.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(400).json({ message: "Failed to create travel log", error: err.message });
    }
  }

  // Read all
  static async getTravelLogs(req, res) {
    try {
      const logs = await TravelLog.find().sort({ startDate: -1 });
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch travel logs", error: err.message });
    }
  }
  
  static async getTravelLogById(req, res) {
    try {
      const { id } = req.params;
      const log = await TravelLog.findById(id);
      
      if (!log) {
        return res.status(404).json({ message: 'Travel log not found' });
      }

      res.json(log);
    } catch (err) {
      res.status(400).json({ message: "Invalid id", error: err.message });
    }
  }

  // Update
  static async updateTravelLog(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Remove fields that shouldn't be updated
      delete updates._id;
      delete updates.__v;
      
      const updatedLog = await TravelLog.findByIdAndUpdate(
        id, 
        updates, 
        { new: true, runValidators: true }
      );
      if (!updatedLog) return res.status(404).json({ message: "Not found" });
      res.json(updatedLog);
    } catch (err) {
      res.status(400).json({ message: "Failed to update", error: err.message });
    }
  }

  // Delete
  static async deleteTravelLog(req, res) {
    try {
      const { id } = req.params;
      
      const deletedLog = await TravelLog.findByIdAndDelete(id);
      
      if (!deletedLog) {
        return res.status(404).json({ message: 'Travel log not found' });
      }

      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ message: "Failed to delete", error: err.message });
    }
  }
}

module.exports = TravelController;