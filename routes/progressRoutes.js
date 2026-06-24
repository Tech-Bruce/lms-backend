const express = require("express");
const router = express.Router();
const LessonProgress = require("../models/LessonProgress");

// @route   POST /api/progress/complete
// @desc    Mark a lesson as complete for a student
// @access  Private (student)
router.post("/complete", async (req, res) => {
  try {
    const { userId, courseId, lessonId } = req.body;

    if (!userId || !courseId || !lessonId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let progress = await LessonProgress.findOne({ userId, courseId, lessonId });

    if (!progress) {
      progress = new LessonProgress({
        userId,
        courseId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      });
    } else {
      progress.completed = true;
      progress.completedAt = new Date();
    }

    await progress.save();

    res.json({ success: true, progress });
  } catch (err) {
    console.error("Error marking lesson complete:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/progress/:userId/:courseId
// @desc    Get all completed lessons for a course
// @access  Private (student)
router.get("/:userId/:courseId", async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const progress = await LessonProgress.find({
      userId,
      courseId,
      completed: true,
    }).select("lessonId");

    res.json({
      success: true,
      completedLessons: progress.map((p) => p.lessonId),
    });
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// (Optional) @route   POST /api/progress/unmark
// @desc    Unmark a lesson as complete
router.post("/unmark", async (req, res) => {
  try {
    const { userId, courseId, lessonId } = req.body;

    if (!userId || !courseId || !lessonId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const progress = await LessonProgress.findOne({ userId, courseId, lessonId });

    if (progress) {
      progress.completed = false;
      progress.completedAt = null;
      await progress.save();
    }

    res.json({ success: true, message: "Lesson unmarked" });
  } catch (err) {
    console.error("Error unmarking lesson:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
