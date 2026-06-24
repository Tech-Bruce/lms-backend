const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createProfile,
  updateProfile,
  getProfile,
  getAllInstructorProfiles,
} = require("../controllers/instructorProfile");
const { assignCourse, getInstructorCourses, getInstructorStudentsByCourseId } = require("../controllers/instructorController");

const router = express.Router();
const dynamicUpload = require('../config/dynamicUpload');
const upload = dynamicUpload('instructors');// CRUD Routes

router.post("/create-profile", upload.single("profileImage"), createProfile);

// ✅ Update instructor profile
router.post("/update-profile", upload.single("profileImage"), updateProfile);

router.post("/enrollments-by-course-ids", getInstructorStudentsByCourseId);

// ✅ Get all instructor profiles
router.get("/all-profiles", getAllInstructorProfiles);

// ✅ Get single instructor profile by userId
router.get("/profile/:userId", getProfile);

/**
 * ==============================
 * Course Assignment Routes
 * ==============================
 */

// ✅ Assign course to instructor
router.post("/assign-course", assignCourse);

// ✅ Get all courses assigned to instructor
router.get("/get-courses/:id", getInstructorCourses);

module.exports = router;
