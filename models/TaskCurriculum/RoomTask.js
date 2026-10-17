const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  hint: {
    type: String,
    default: "",
  },
  correctAnswer: {
    type: String,
    default: "",
  },
  xp: {
    type: Number,
    default: 10,
  },
});

const RoomTaskSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskCourse",
      required: true,
      index: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChapterRoom",
      required: true,
      index: true,
    },
    taskNumber: {
      type: String,
      default: "Task 1",
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    overview: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: true, // Markdown or HTML content
    },
    learningObjectives: [
      {
        type: String,
      },
    ],
    prerequisites: [
      {
        type: String,
      },
    ],
    questions: [QuestionSchema],
    xp: {
      type: Number,
      default: 20,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoomTask", RoomTaskSchema);
