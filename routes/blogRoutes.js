const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createBlog,
  getBlogs,
  updateBlog,   // ✅ add this
  deleteBlog    // (optional, if you plan to delete blogs)
} = require("../controllers/blogController");

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.post("/", upload.single("file"), createBlog);
router.get("/", getBlogs);
router.put("/:id", upload.single("file"), updateBlog); // ✅ now works
router.delete("/:id", deleteBlog); // optional

module.exports = router;
