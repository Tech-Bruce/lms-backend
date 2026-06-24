const express = require('express');
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getAllCoursesForNav,
  getCourseLearningById
} = require('../controllers/courseController');
const dynamicUpload = require('../config/dynamicUpload');
const upload = dynamicUpload('course');// CRUD Routes
router.get('/', getAllCourses); // GET /api/v1/courses
router.get('/nav', getAllCoursesForNav); // GET /api/v1/courses/nav
router.get('/:courseId', getCourseById); // GET /api/v1/courses/:id
router.get('/learning/:courseId', getCourseLearningById); // GET /api/v1/courses/instructor/:instructorId
router.post('/', upload.single('thumbnail'), createCourse); // POST /api/v1/courses
router.put('/:id', upload.single('thumbnail'), updateCourse); // PUT /api/v1/courses/:id
router.delete('/:id', deleteCourse); // DELETE /api/v1/courses/:id ✅ this is the delete one

module.exports = router;
