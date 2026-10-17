const express = require("express");
const router = express.Router();
const controller = require("../controllers/taskCurriculumController");

// ==========================================
// SEED & FULL TREE ROUTES
// ==========================================
router.post("/seed", controller.seedReferenceData);
router.get("/full-tree", controller.getFullCurriculumTree);
router.post("/bulk-upload", controller.bulkUploadCourse);
router.delete("/clear-all", controller.clearAllCurriculum);

// ==========================================
// COURSE / MODULE ROUTES
// ==========================================
router.get("/courses", controller.getAllCourses);
router.post("/courses", controller.createCourse);
router.get("/courses/:id", controller.getCourseById);
router.put("/courses/:id", controller.updateCourse);
router.delete("/courses/:id", controller.deleteCourse);

// ==========================================
// CHAPTER / ROOM ROUTES
// ==========================================
router.get("/chapters", controller.getChapters);
router.post("/chapters", controller.createChapter);
router.get("/chapters/:id", controller.getChapterById);
router.put("/chapters/:id", controller.updateChapter);
router.delete("/chapters/:id", controller.deleteChapter);

// ==========================================
// TASK ROUTES
// ==========================================
router.get("/tasks", controller.getTasks);
router.post("/tasks", controller.createTask);
router.get("/tasks/:id", controller.getTaskById);
router.put("/tasks/:id", controller.updateTask);
router.delete("/tasks/:id", controller.deleteTask);

module.exports = router;
