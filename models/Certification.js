const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  skillsAssessed: {
    type: [String],
    required: true,
  },
  format: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  prerequisites: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['Active', 'Coming Soon', 'Retired'],
    default: 'Active',
  },
  overview: {
    type: String,
    required: true,
  },
  assessmentStructure: {
    type: String,
    required: true,
  },
  practicalComponents: {
    type: [String],
    default: [],
  },
  preparation: {
    type: String,
    default: '',
  },
  attemptInfo: {
    type: String,
    default: '',
  }
}, { timestamps: true });

module.exports = mongoose.model('Certification', certificationSchema);
