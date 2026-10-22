const mongoose = require("mongoose");

const MissionProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mission",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    completedTasks: {
      type: [Number], // Array of taskNumber values solved
      default: [],
    },
    progress: {
      type: Number, // Percentage 0 - 100
      default: 0,
    },
    earnedXp: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound index to guarantee one progress record per user per mission
MissionProgressSchema.index({ userId: 1, missionId: 1 }, { unique: true });

module.exports = mongoose.model("MissionProgress", MissionProgressSchema);
