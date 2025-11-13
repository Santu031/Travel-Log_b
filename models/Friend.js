const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    friend: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

friendSchema.index({ user: 1, friend: 1 }, { unique: true });

module.exports = mongoose.model("Friend", friendSchema);




