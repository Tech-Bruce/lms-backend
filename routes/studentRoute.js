
const StudentController = require('../controllers/StudentContoller');
const express = require('express');
const router = express.Router();

router.get('/enrollments/:userId',StudentController.getEnrollments );
router.post('/enrollments/:userId',StudentController.enrollInCourse );

module.exports = router;