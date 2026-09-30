const express = require('express');
const { createInstructor, updateInstructor } = require('../controllers/instructorController');
const userModel = require('../models/userModel');
const router = express.Router();
// const Instructor = require('../models/Instructor');

// POST create instructor
router.post('/create-instructor', async (req, res) => {
  const { name, email, course } = req.body;
 createInstructor(req, res);
});
// GET all students
router.get('/students', async (req, res) => {
  try {
    const students = await userModel.find({ role: 'student' }); 
    res.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ msg: "Server error while fetching students" });
  }
});

// GET all instructors
router.get('/instructors', async (req, res) => {
  const instructors = await userModel.find({ role: { $in: ['instructor'] } });

  res.json({ instructors });
});

// PUT update instructor
router.put('/update-instructor/:id', async (req, res) => {
  return updateInstructor(req, res);
});

// DELETE instructor
router.delete('/delete-instructor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userModel = require('../models/userModel');
    const InstructorProfile = require('../models/InstructorProfile');
    const Course = require('../models/courseModel');
    
    // Delete the user and their profile
    await userModel.findByIdAndDelete(id);
    await InstructorProfile.findOneAndDelete({ userId: id });
    
    // Unassign instructor from any course
    await Course.updateMany(
      { instructor: id },
      { $unset: { instructor: 1 } }
    );
    
    res.json({ msg: 'Instructor deleted successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Error deleting instructor', error: error.message });
  }
});

// GET all bookings (slots)
router.get('/bookings', async (req, res) => {
  try {
    const Slot = require('../models/Slot');
    const bookings = await Slot.find({ booked: true })
      .populate('mentor', 'name email')
      .sort({ start: 1 });
    res.json({ status: 'success', data: bookings });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
});

module.exports = router;
