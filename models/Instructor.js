const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  expertise: {
    type: [String],
    default: [],
    required: false
  },
  experience: {
    type: String,
    default: '',
    required: false
  },
  bio: {
    type: String,
    default: '',
    maxlength: 1000
  },
  profileImage: {
    type: String,
    default: '' // store image filename or URL
  },
  socialLinks: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  certifications: {
    type: [String], // list of certificate names/URLs
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Instructor', instructorSchema);
