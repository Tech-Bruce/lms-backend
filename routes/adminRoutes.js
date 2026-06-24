const express = require('express');
const { createInstructor, updateInstructor } = require('../controllers/instructorController');
const userModel = require('../models/userModel');
const router = express.Router();
// const Instructor = require('../models/Instructor');

// POST create instructor
router.post('/create-instructor', async (req, res) => {
  const { name, email, password, course } = req.body;
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
  const { id } = req.params;
  const updated = await updateInstructor(req, res);
  if (!updated) {
    return res.status(404).json({ msg: 'Instructor not found' });
  }
  res.json({ msg: 'Instructor updated successfully', updated });
});

// DELETE instructor
router.delete('/delete-instructor/:id', async (req, res) => {
  const { id } = req.params;
  await Instructor.findByIdAndDelete(id);
  res.json({ msg: 'Instructor deleted successfully' });
});

module.exports = router;
