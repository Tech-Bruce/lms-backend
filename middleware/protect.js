const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  let token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Not logged in' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ msg: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token invalid or expired' });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log('User role:', req.user.role);
    console.log('Allowed roles:', roles);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'You do not have permission' });
    }
    next();
  };
};
