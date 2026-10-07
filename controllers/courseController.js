const e = require('express');
const mongoose = require('mongoose');

const Course = require('../models/courseModel');
const fs = require("fs");
const path = require("path");
const deleteFileIfExists = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, "..", "uploads","course", filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, category, description, price, status, featured, isNav } = req.body;

    let parsedSyllabus = [];
    if (req.body.syllabus) {
      try {
        parsedSyllabus = typeof req.body.syllabus === 'string' ? JSON.parse(req.body.syllabus) : req.body.syllabus;
      } catch (e) {
        parsedSyllabus = Array.isArray(req.body.syllabus) ? req.body.syllabus : [req.body.syllabus];
      }
    }

    const course = new Course({
      title,
      category,
      description,
      price,
      status,
      featured: featured === "true" || featured === true, // FormData sends strings
      isNav: isNav === "true" || isNav === true,
      syllabus: parsedSyllabus,
      thumbnail: req.file ? req.file.filename : null,
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: "Failed to create course", message: err.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses', message: err.message });
  }
};
exports.getAllCoursesForNav = async (req, res) => {
  try {
const courses = await Course.find({ isNav: true })
  .select('title category')  
  .sort({ createdAt: -1 });
  res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses', message: err.message });
  }
};
// Get a single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById({ _id: req.params.courseId || req.params.id });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json(course);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID', message: err.message });
  }
};
// exports.getCourseLearningById = async (req, res) => {
//   try {
//     const courseId = new mongoose.Types.ObjectId(req.params.courseId);

//     const courseData = await Course.aggregate([
//       // Match the course by ID
//       { $match: { _id: courseId } },

//       // Lookup modules for the course
//       {
//         $lookup: {
//           from: 'modules',
//           localField: '_id',
//           foreignField: 'course',
//           as: 'modules'
//         }
//       },

//       // Unwind modules to lookup lessons for each
//       {
//         $unwind: {
//           path: '$modules',
//           preserveNullAndEmptyArrays: true
//         }
//       },

//       // Lookup lessons for each module
//       {
//         $lookup: {
//           from: 'lessons',
//           localField: 'modules._id',
//           foreignField: 'moduleId',
//           as: 'modules.lessons'
//         }
//       },

//       // Group back modules (with their lessons) into array
//       {
//         $group: {
//           _id: '$_id',
//           title: { $first: '$title' },
//           category: { $first: '$category' },
//           description: { $first: '$description' },
//           price: { $first: '$price' },
//           status: { $first: '$status' },
//           thumbnail: { $first: '$thumbnail' },
//           featured: { $first: '$featured' },
//           isNav: { $first: '$isNav' },
//           students: { $first: '$students' },
//           createdAt: { $first: '$createdAt' },
//           updatedAt: { $first: '$updatedAt' },
//           modules: { $push: '$modules' }
//         }
//       }
//     ]);

//     if (!courseData || courseData.length === 0) {
//       return res.status(404).json({ error: 'Course not found' });
//     }

//     res.status(200).json(courseData[0]);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server Error', message: err.message });
//   }
// };
exports.getCourseLearningById = async (req, res) => {
  try {
    const courseId = new mongoose.Types.ObjectId(req.params.courseId);

    const courseData = await Course.aggregate([
      // Match the course by ID
      { $match: { _id: courseId } },

      // Lookup modules
      {
        $lookup: {
          from: "modules",
          localField: "_id",
          foreignField: "course",
          as: "modules",
        },
      },

      // Unwind modules
      {
        $unwind: {
          path: "$modules",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup lessons for each module
      {
        $lookup: {
          from: "lessons",
          localField: "modules._id",
          foreignField: "moduleId",
          as: "modules.lessons",
        },
      },

      // Unwind lessons so we can attach quizzes
      {
        $unwind: {
          path: "$modules.lessons",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup quizzes for each lesson
      {
        $lookup: {
          from: "quizzes",
          localField: "modules.lessons._id",
          foreignField: "lessonId",
          as: "modules.lessons.quizzes",
        },
      },

      // Group lessons back under modules
      {
        $group: {
          _id: "$modules._id",
          moduleTitle: { $first: "$modules.title" },
          lessons: { $push: "$modules.lessons" },
          root: { $first: "$$ROOT" },
        },
      },

      // Group modules back under course
      {
        $group: {
          _id: "$root._id",
          title: { $first: "$root.title" },
          category: { $first: "$root.category" },
          description: { $first: "$root.description" },
          price: { $first: "$root.price" },
          status: { $first: "$root.status" },
          thumbnail: { $first: "$root.thumbnail" },
          featured: { $first: "$root.featured" },
          isNav: { $first: "$root.isNav" },
          students: { $first: "$root.students" },
          createdAt: { $first: "$root.createdAt" },
          updatedAt: { $first: "$root.updatedAt" },
          modules: {
            $push: {
              _id: "$_id",
              title: "$moduleTitle",
              lessons: "$lessons",
            },
          },
        },
      },
    ]);

    if (!courseData || courseData.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json(courseData[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error", message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Build payload only with provided fields
    let parsedSyllabus = undefined;
    if (req.body.syllabus) {
      try {
        parsedSyllabus = typeof req.body.syllabus === 'string' ? JSON.parse(req.body.syllabus) : req.body.syllabus;
      } catch (e) {
        parsedSyllabus = Array.isArray(req.body.syllabus) ? req.body.syllabus : [req.body.syllabus];
      }
    }

   let payload = {
  title: req.body.title,
  category: req.body.category,
  description: req.body.description,
  price: req.body.price,
  status: req.body.status,
  featured: req.body.featured,
  isNav: req.body.isNav,
  ...(parsedSyllabus !== undefined && { syllabus: parsedSyllabus }),
};
    // Handle new thumbnail upload
    if (req.file) {
      if (course.thumbnail) deleteFileIfExists(course.thumbnail);
      payload.thumbnail = req.file.filename;
    }

 course.set(payload);

    // Save updated course
    const updatedCourse = await course.save();

    res.status(200).json(updatedCourse);
  } catch (err) {
    res.status(400).json({ error: "Failed to update course", message: err.message });
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Remove thumbnail if exists
    if (course.thumbnail) {
      deleteFileIfExists(course.thumbnail);
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error: error.message });
  }
};
