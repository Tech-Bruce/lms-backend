const mongoose = require("mongoose");

const EvidenceArtifactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  artifactType: {
    type: String,
    enum: ["Log", "Command", "Hash", "Network", "Email", "Config", "Other"],
    default: "Log",
  },
  content: {
    type: String,
    required: true,
  },
});

const MissionTaskSchema = new mongoose.Schema({
  taskNumber: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  hint: {
    type: String,
    default: "",
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  xp: {
    type: Number,
    default: 50,
  },
});

const MissionSchema = new mongoose.Schema(
  {
    missionCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: "Endpoint Security",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    estimatedDuration: {
      type: String,
      default: "45 min",
      trim: true,
    },
    xpReward: {
      type: Number,
      default: 150,
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    incidentBriefing: {
      type: String,
      default: "",
    },
    mitreTechnique: {
      type: String,
      default: "",
      trim: true,
    },
    evidenceArtifacts: [EvidenceArtifactSchema],
    tasks: [MissionTaskSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mission", MissionSchema);
