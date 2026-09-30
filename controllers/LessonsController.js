// controllers/lessonController.js
const fs = require("fs");
const path = require("path");
const Lesson = require("../models/Course/Lesson");

// helper to delete old PDF if it exists
const deleteFileIfExists = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, "..", "uploads", "lessons", filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const LessonsController = {
  // Create a lesson
  create: async (req, res) => {
    try {
      let payload = { ...req.body };

      if (req.file) {
        payload.pdfUrl = req.file.filename; // save only filename
      }

      const lesson = new Lesson(payload);
      await lesson.save();

      res.status(201).json(lesson);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Get all lessons
  getAll: async (req, res) => {
    try {
      const lessons = await Lesson.find();
      res.status(200).json(lessons);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Get lessons by moduleId
  getByModuleId: async (req, res) => {
    try {
      const { moduleId } = req.params;
      const lessons = await Lesson.find({ moduleId });
      res.status(200).json(lessons);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Get lesson by ID
  getById: async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.status(200).json(lesson);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Update lesson
  update: async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      let payload = { ...req.body };

      // If new PDF uploaded, delete old one and update reference
      if (req.file) {
        if (lesson.pdfUrl) {
          deleteFileIfExists(lesson.pdfUrl);
        }
        payload.pdfUrl = req.file.filename;
      }

      const updatedLesson = await Lesson.findByIdAndUpdate(
        req.params.id,
        payload,
        { new: true }
      );

      res.status(200).json(updatedLesson);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Delete lesson
  delete: async (req, res) => {
    try {
      const lesson = await Lesson.findByIdAndDelete(req.params.id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      // Delete attached PDF if exists
      if (lesson.pdfUrl) {
        deleteFileIfExists(lesson.pdfUrl);
      }

      res.status(200).json({ message: "Lesson deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = LessonsController;
