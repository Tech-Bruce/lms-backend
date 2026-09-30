 const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["video", "text", "pdf", "quiz"], default: "video" },
  content: String, // For text
  videoUrl: String,
  pdfUrl: String,
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  duration: Number // minutes
}, { timestamps: true });
module.exports = mongoose.model('Lesson', LessonSchema);