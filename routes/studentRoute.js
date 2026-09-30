
const StudentController = require('../controllers/StudentContoller');
const express = require('express');
const router = express.Router();

router.get('/enrollments/:userId',StudentController.getEnrollments );
router.post('/enrollments/:userId',StudentController.enrollInCourse );

router.post('/payment/create-order', StudentController.createPaymentOrder);
router.post('/payment/verify/:userId', StudentController.verifyPaymentAndEnroll);

module.exports = router;