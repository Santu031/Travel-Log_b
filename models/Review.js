const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    author: { type: String, required: true, trim: true },
    avatar: { type: String, default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    destination: { type: String, default: "" },
    date: { type: Date, default: () => new Date() },
    photos: { type: [String], default: [] },
    helpful: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);