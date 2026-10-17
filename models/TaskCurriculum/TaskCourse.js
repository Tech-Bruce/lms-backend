const mongoose = require("mongoose");

const TaskCourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    track: {
      type: String,
      required: true,
      trim: true,
      default: "Network Fundamentals",
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "Network", // e.g. Network, Shield, Server, Share2, Terminal, Lock, Cpu, Database
    },
    badgeColor: {
      type: String,
      default: "blue", // blue, cyan, purple, emerald, amber, rose
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
    order: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskCourse", TaskCourseSchema);
