const Enrollment = require('../models/Enrollments');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const { sendEmail } = require('../service/EmailHandler');
const Razorpay = require('razorpay');
const crypto = require('crypto');

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

  createPaymentOrder: async (req, res) => {
    try {
      const { courseId } = req.body;
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

      const keyId = (process.env.razorpay_key || process.env.RAZORPAY_KEY_ID || '').replace(',', '').trim();
      const keySecret = (process.env.razorpay_secret || process.env.RAZORPAY_KEY_SECRET || '').trim();

      const razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const options = {
        amount: Math.round(course.price * 100), // amount in smallest unit (paise)
        currency: "INR", // Test accounts often fail on USD without international enabled
        receipt: `rcpt_${courseId.toString().substring(0, 10)}_${Date.now().toString().slice(-6)}`,
      };

      const order = await razorpayInstance.orders.create(options);
      res.status(200).json({ success: true, order });
    } catch (error) {
      console.error('Error creating payment order:', error);
      res.status(500).json({ success: false, message: 'Payment order creation failed' });
    }
  },

  verifyPaymentAndEnroll: async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
      const { userId } = req.params;

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const keySecret = (process.env.razorpay_secret || process.env.RAZORPAY_KEY_SECRET || '').trim();

      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        // Payment valid, enroll the student
        const alreadyEnrolled = await Enrollment.findOne({ studentId: userId, courseId });
        if (alreadyEnrolled) {
          return res.status(400).json({ success: false, message: 'Already enrolled' });
        }
        const enrollment = new Enrollment({
          studentId: userId,
          courseId,
        });
        await enrollment.save();

        res.status(200).json({ success: true, message: 'Payment verified and enrolled successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
  },
};

module.exports = StudentController;
