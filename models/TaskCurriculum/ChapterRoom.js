const mongoose = require("mongoose");

const ChapterRoomSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskCourse",
      required: true,
      index: true,
    },
    roomNumber: {
      type: String,
      default: "Room 01",
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Beginner", "Intermediate", "Advanced"],
      default: "Easy",
    },
    estimatedTime: {
      type: String,
      default: "45 minutes",
    },
    xp: {
      type: Number,
      default: 100,
    },
    icon: {
      type: String,
      default: "Network", // Network, Share2, Cable, Server, Layers, Cpu, Shield, Terminal
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChapterRoom", ChapterRoomSchema);
