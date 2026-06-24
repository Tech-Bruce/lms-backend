const Enrollment = require('../models/Enrollments');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const { sendEmail } = require('../service/EmailHandler');

const StudentController = {
  // Get all enrollments for a student
  getEnrollments: async (req, res) => {
    try {
      const { userId } = req.params;

      // Validate if student exists
      const student = await User.findById(userId);
      if (!student || student.role !== 'student') {
        return res.status(404).json({ message: 'Student not found or invalid role' });
      }

      const enrollments = await Enrollment.find({ studentId: userId }).populate('courseId');
      res.status(200).json({ enrollments });
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  //create  Enroll a student in a course
  enrollInCourse: async (req, res) => {
    try {
      const { userId } = req.params;
      const { courseId } = req.body;

      // Check if student exists
      const student = await User.findById(userId);
      if (!student || student.role !== 'student') {
        return res.status(404).json({ success: false, message: 'Student not found or invalid role' });
      }

      // Check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Prevent duplicate enrollment
      const alreadyEnrolled = await Enrollment.findOne({ studentId: userId, courseId });
      if (alreadyEnrolled) {
        return res.status(400).json({success: false, message: 'Your are  already enrolled in this course' });
      }

      const enrollment = new Enrollment({
        studentId: userId,
        courseId,
      });

      await enrollment.save();
      // const payload={
      //   to:'',
      //  subject:'',
      //  text:'', 
      //  html:''
      // }
      // await sendEmail(payload)
      res.status(201).json({ success: true, message: 'Enrolled successfully', enrollment });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },
};

module.exports = StudentController;
