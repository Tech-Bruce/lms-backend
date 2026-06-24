const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/sendToken");
const bcrypt = require('bcryptjs');

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    // ✅ Hash the password manually
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with hashed password
    const user = await User.create({ name, email, password: hashedPassword });

    // Send JWT token
    sendToken(user, res);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  console.log(`🔍 Attempting login for user: ${user}`);
  if (!user) {
    console.log(`❌ No user found with email: ${email}`);
    return res.status(401).json({ msg: 'Invalid credentials' });
  }
  if(!user.isActive) {
    console.log(`❌ Inactive user attempted login: ${email}`);
    return res.status(403).json({ msg: 'Account is inactive. Please contact support.' });
  }
  const isMatch = await user.correctPassword(password);
  if (!isMatch) {
    console.log(`❌ Password mismatch for user: ${email}`);
    return res.status(401).json({ msg: 'Invalid credentials' });
  }

  console.log(`✅ User logged in: ${email}`);
  sendToken(user, res);
};
