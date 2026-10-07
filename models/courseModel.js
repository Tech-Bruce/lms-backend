const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft',
    },
    thumbnail: {
      type: String,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isNav:{
      type: Boolean,
      default: false,
    },
    students: {
      type: Number,
      default: 0,
    },
    syllabus: [{
      type: String,
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
