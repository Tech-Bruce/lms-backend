const Blog = require("../models/Blog");

// Create Blog
exports.createBlog = async (req, res) => {
  try {
    const { title, description, type, content, createdBy } = req.body;
    const file = req.file;

    const blogData = {
      title,
      description,
      type,
      content,
      createdBy,
    };

    // Only add fileUrl if a file was uploaded
    if (file) {
      blogData.fileUrl = file.filename;
    }

    const blog = await Blog.create(blogData);

    res.status(201).json(blog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: error.message });
  }
};


// Get All Blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update Blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, createdBy } = req.body;
    let updateData = { title, description, type, createdBy };

    if (req.file) {
      updateData.fileUrl = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true });

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
