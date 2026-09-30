const Module = require("../models/Course/Module");

const moduleController = {
  // Get all modules for a course
  getAllModules: async (req, res) => {
    try {
      const { courseId } = req.query;
      if (!courseId) {
        return res.status(400).json({ message: "courseId is required" });
      }
      const modules = await Module.find({ course: courseId });
      res.status(200).json(modules);
    } catch (error) {
      res.status(500).json({ message: "Error fetching modules", error });
    }
  },

  // Get a specific module by ID
  getModuleById: async (req, res) => {
    try {
      const { moduleId } = req.params;
      const module = await Module.findById(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.status(200).json(module);
    } catch (error) {
      res.status(500).json({ message: "Error fetching module", error });
    }
  },

  // Create a module
  createModule: async (req, res) => {
    try {
      const { courseId, title, description ,order} = req.body;
      if (!courseId || !title) {
        return res.status(400).json({ message: "courseId and title are required" });
      }
      const newModule = new Module({
        course: courseId,
        title,
        description,
        order: order 
      });
      const savedModule = await newModule.save();
      res.status(201).json(savedModule);
    } catch (error) {
      res.status(500).json({ message: "Error creating module", error });
    }
  },

  // Update a module
  updateModule: async (req, res) => {
    try {
      const { moduleId } = req.params;
      const updatedModule = await Module.findByIdAndUpdate(
        moduleId,
        req.body,
        { new: true }
      );
      if (!updatedModule) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.status(200).json(updatedModule);
    } catch (error) {
      res.status(500).json({ message: "Error updating module", error });
    }
  },

  // Delete a module
  deleteModule: async (req, res) => {
    try {
      const { moduleId } = req.params;
      const deletedModule = await Module.findByIdAndDelete(moduleId);
      if (!deletedModule) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.status(200).json({ message: "Module deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting module", error });
    }
  },
};

module.exports = moduleController;
