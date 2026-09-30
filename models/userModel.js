const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student",
  },
  isActive: {
    type: Boolean,
    default: true,  
  },
  strike: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastLogin: {
    type: Date,
  },
}, { timestamps: true });
userSchema.methods.correctPassword = async function (enteredPass) {
  return await bcrypt.compare(enteredPass, this.password);
};

module.exports = mongoose.model("User", userSchema);
