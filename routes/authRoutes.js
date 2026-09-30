const express = require('express');
const { register, login } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/protect');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { createInstructor } = require('../controllers/instructorController');

const router = express.Router();  // ✅ define router first

// Create Admin (only once)
router.get('/create-admin', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });

    if (existingAdmin) {
      return res.send('⚠️ Admin already exists');
    }

    const hashed = await bcrypt.hash('admin@123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: hashed,
      role: 'admin'
    });

    res.send('✅ Admin user created');
  } catch (error) {
    console.error(error);
    res.status(500).send('❌ Error creating admin');
  }
});

// Auth Routes
router.post('/register', register);
router.post('/login', login);

// Admin Protected Route
router.post('/admin/create-instructor', protect, restrictTo('admin'), createInstructor);

module.exports = router;
