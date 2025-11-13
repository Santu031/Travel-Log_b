const mongoose = require("mongoose");

const travelLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    imageUrl: { type: String, default: "" },
    // Added expense tracking
    expenses: {
      type: [{
        category: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        description: { type: String, default: "" }
      }],
      default: []
    },
    totalExpense: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TravelLog", travelLogSchema);