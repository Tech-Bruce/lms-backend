const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ["video", "poster", "document"], required: true },
  content: String,
  fileUrl: { type: String, required: false },
  createdBy: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Blog", blogSchema);
