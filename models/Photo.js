const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dataUrl: { type: String, required: true },
    caption: { type: String, default: "" },
    location: { type: String, default: "" },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Photo", photoSchema);