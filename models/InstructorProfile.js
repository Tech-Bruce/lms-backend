const mongoose = require("mongoose");

const instructorProfileSchema = new mongoose.Schema(
  {
    userId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true,
       unique: true
     },

    expertise: {
      type: [String],
      default: [],
    },

    experience: {
      type: String,
      required: [true, "Experience field is required"],
      trim: true,
    },

    bio: {
      type: String,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
      trim: true,
    },

    socialLinks: {
      linkedin: {
        type: String,
        trim: true,
      },
      twitter: {
        type: String,
        trim: true,
      },
      github: {
        type: String,
        trim: true,
      },
      portfolio: {
        type: String,
        trim: true,
      },
    },

    certifications: {
      type: [String],
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    profileImage: {
      type: String, // Stores image path or URL
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto added
  }
);

// ✅ Prevents OverwriteModelError & caching issues
module.exports =
  mongoose.models.InstructorProfile ||
  mongoose.model("InstructorProfile", instructorProfileSchema);
