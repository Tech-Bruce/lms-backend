const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/sendToken");
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");

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

// Forgot Password - Send 6-digit OTP to Email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ msg: "Please provide an email address." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "No account found with this email address." });
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Expiration: 15 minutes from now
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;
    await user.save();

    // Prepare Nodemailer transport
    const pass = (process.env.EMAIL_APP_PASS || '').replace(/"/g, '');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: pass
      }
    });

    const mailOptions = {
      from: `"Cyber Security Brigade" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Password Reset Code - Cyber Security Brigade",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #030712; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(6,182,212,0.3);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #22d3ee; margin: 0; font-size: 24px;">Cyber Security Brigade</h1>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Password Reset Request</p>
          </div>
          <p style="color: #cbd5e1; font-size: 14px;">Hello <strong>${user.name || 'Analyst'}</strong>,</p>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">We received a request to reset your password. Use the verification code below to authorize the credential change:</p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="display: inline-block; background-color: rgba(6,182,212,0.15); border: 1px solid #22d3ee; color: #22d3ee; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 12px 24px; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">This code will expire in <strong>15 minutes</strong>.</p>
          <p style="color: #64748b; font-size: 11px; margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">If you did not initiate this request, please disregard this email. Your account remains secured.</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset OTP sent to: ${user.email}`);
    } catch (mailErr) {
      console.error(`⚠️ Email dispatch error:`, mailErr.message);
      // In development fallback, return otp so testing is not blocked
      return res.status(200).json({
        msg: "Reset code generated. Check your email or use development preview.",
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
      });
    }

    res.status(200).json({ msg: "Verification code sent to your email address!" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ msg: "Failed to process password reset request." });
  }
};

// Reset Password - Verify OTP & Set New Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ msg: "Please provide email, verification code, and new password." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters long." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User account not found." });
    }

    // Check OTP
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp.trim()) {
      return res.status(400).json({ msg: "Invalid verification code. Please check your email." });
    }

    // Check expiration
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ msg: "Verification code has expired. Please request a new code." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log(`✅ Password successfully reset for user: ${email}`);
    res.status(200).json({ msg: "Password reset successfully! You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ msg: "Internal server error while resetting password." });
  }
};
