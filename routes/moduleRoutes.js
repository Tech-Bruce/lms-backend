const express = require('express');
const moduleController = require('../controllers/moduleController');

const router = express.Router();
 router.get('/',moduleController.getAllModules); // GET /api/v1/modules body{courseId   }
router.get('/:moduleId', moduleController.getModuleById); // GET /api/v1/modules/:moduleId
router.post('/', moduleController.createModule); // POST /api/v1/modules body{courseId, title, description}
router.put('/:moduleId', moduleController.updateModule); // PUT /api/v1/modules/:
router.delete('/:moduleId', moduleController.deleteModule); // DELETE /api/v1/modules/:moduleId
module.exports = router;