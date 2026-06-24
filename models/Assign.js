// models/assignModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assignSchema = new Schema({
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['Lead-Instructor', 'Assistant', 'Guest-Lecturer'],
    default: 'Lead-Instructor'
  }
});

module.exports = mongoose.model('Assign', assignSchema);
