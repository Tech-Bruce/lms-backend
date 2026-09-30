const express = require('express');
const LessonsController = require('../controllers/LessonsController');
const router = express.Router();
const dynamicUpload = require('../config/dynamicUpload');
const upload = dynamicUpload('lessons');// CRUD Routes
// Create a new lesson
router.post('/', upload.single('pdfFile'), LessonsController.create);

// Get all lessons
router.get('/', LessonsController.getAll);

// Get lessons by moduleId
router.get('/module/:moduleId', LessonsController.getByModuleId); // updated camelCase

// Get a single lesson by ID
router.get('/:id', LessonsController.getById);

// Update a lesson
router.put('/:id', LessonsController.update);

// Delete a lesson
router.delete('/:id', LessonsController.delete);

module.exports = router;

