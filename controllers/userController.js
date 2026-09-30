const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const UserController = {
  // CREATE
  createUser: async (req, res) => {
    try {
      const { name, email, password, role, course } = req.body;

      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ msg: 'Email already exists' });

      const hashedPassword = await bcrypt.hash(password, 10); // hash with salt rounds = 12

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        course
      });

      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
// READ (All Students)
getAllStudents: async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password"); // only students
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
},

  // READ (All Users)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select('-password'); // exclude password from response
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // READ (Single User by ID)
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) return res.status(404).json({ msg: 'User not found' });

      // Daily streak logic
      const now = new Date();
      const lastLoginDate = user.lastLogin ? new Date(user.lastLogin) : new Date(0);
      
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastDate = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());
      
      const diffTime = today - lastDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let updated = false;
      if (diffDays === 1) {
        user.streak = (user.streak || 0) + 1;
        user.lastLogin = now;
        updated = true;
      } else if (diffDays > 1) {
        user.streak = 1;
        user.lastLogin = now;
        updated = true;
      } else if (!user.lastLogin) {
        user.streak = 1;
        user.lastLogin = now;
        updated = true;
      }

      if (updated) {
        await user.save();
      }

      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // UPDATE
  updateUser: async (req, res) => {
    try {
      const { password, ...rest } = req.body;
      let updatedData = { ...rest };

      // Hash password if provided
      if (password) {
        const hashed = await bcrypt.hash(password, 10);
        updatedData.password = hashed;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );

      if (!updatedUser) return res.status(404).json({ msg: 'User not found' });

      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // DELETE
  deleteUser: async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) return res.status(404).json({ msg: 'User not found' });

      res.status(200).json({ msg: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  }
};

module.exports = UserController;
