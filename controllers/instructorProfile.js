const InstructorProfile = require("../models/InstructorProfile");
const User = require("../models/userModel");
const { deleteFileIfExists } = require("../utils/utils");
exports.createProfile = async (req, res) => {
  try {
    const {
      userId,
      expertise,
      experience,
      bio,
      socialLinks,
      certifications,
      isVerified,
    } = req.body;

    // ✅ 1. Validate userId
    if (!userId) {
      return res
        .status(400)
        .json({ status: "fail", message: "userId is required" });
    }

    // ✅ 2. Check if user exists and is an instructor
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }
    if (user.role !== "instructor") {
      return res
        .status(403)
        .json({ status: "fail", message: "User is not an instructor" });
    }

    // ✅ 3. Prevent duplicate profile
    const existingProfile = await InstructorProfile.findOne({ userId });
    if (existingProfile) {
      return res
        .status(400)
        .json({ status: "fail", message: "Profile already exists" });
    }

    // ✅ 4. Validate required fields (experience required by schema)
    if (!experience || typeof experience !== "string") {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Experience is required and must be a string",
        });
    }

    // ✅ 5. Parse fields safely
    let parsedExpertise = [];
    let parsedSocialLinks = {};
    let parsedCertifications = [];

    try {
      parsedExpertise =
        typeof expertise === "string" ? JSON.parse(expertise) : expertise || [];
      parsedSocialLinks =
        typeof socialLinks === "string"
          ? JSON.parse(socialLinks)
          : socialLinks || {};
      parsedCertifications =
        typeof certifications === "string"
          ? JSON.parse(certifications)
          : certifications || [];
    } catch (parseErr) {
      return res
        .status(400)
        .json({
          status: "fail",
          message: "Invalid JSON in expertise, socialLinks, or certifications",
        });
    }

    // ✅ 6. Handle image upload
    const profileImage = req.file ? `${req.file.filename}` : "";

    // ✅ 7. Create profile
    const profile = await InstructorProfile.create({
      userId,
      expertise: parsedExpertise,
      experience,
      bio,
      socialLinks: parsedSocialLinks,
      certifications: parsedCertifications,
      isVerified: isVerified === "true" || isVerified === true,
      profileImage,
    });

    return res.status(201).json({ status: "success", data: profile });
  } catch (err) {
    console.error("Create Profile Error:", err);
    return res
      .status(500)
      .json({ status: "fail", message: "Internal Server Error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      userId,
      expertise,
      experience,
      bio,
      socialLinks,
      certifications,
      isVerified,
    } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ status: "fail", message: "userId is required" });
    }

    // If new profile image is uploaded
    let profileImage;
    const existingProfile = await InstructorProfile.findOne({ userId });

    if (req.file) {
      profileImage = req.file.filename;

      // Find current profile to get the old image name
      if (existingProfile?.profileImage) {
        await deleteFileIfExists({
          folderName: "instructors",
          filename: existingProfile.profileImage,
        });
      }
    }

    const updated = await InstructorProfile.findOneAndUpdate(
      { userId },
      {
        ...(expertise && { expertise: JSON.parse(expertise) }),
        ...(experience && { experience }),
        ...(bio && { bio }),
        ...(socialLinks && { socialLinks: JSON.parse(socialLinks) }),
        ...(certifications && { certifications: JSON.parse(certifications) }),
        ...(typeof isVerified !== "undefined" && { isVerified }),
        ...(profileImage && { profileImage }),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Profile not found" });

    res.status(200).json({ status: "success", data: updated });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ status: "fail", message: err.message });
  }
};

exports.getAllInstructorProfiles = async (req, res) => {
  try {
    const instructors = await User.aggregate([
      {
        $match: { role: "instructor" }, // Step 1: Filter instructors
      },
      {
        $lookup: {
          from: "instructorprofiles", // collection name
          localField: "_id",
          foreignField: "userId",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true, // keep users even if no profile
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          profile: 1,
        },
      },
    ]);

    res.status(200).json({ status: "success", data: instructors });
  } catch (err) {
    console.error("Get All Instructor Profiles Error:", err);
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// ✅ Get Single Profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await InstructorProfile.findOne({
      userId: req.params.userId,
    });
    if (!profile) return res.status(404).json({ msg: "Profile not found" });

    res.status(200).json({ status: "success", data: profile });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ status: "fail", message: err.message });
  }
};
