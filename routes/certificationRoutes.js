const express = require('express');
const router = express.Router();
const {
  getAllCertifications,
  getCertificationById,
  createCertification,
  updateCertification,
  deleteCertification
} = require('../controllers/certificationController');

router.route('/')
  .get(getAllCertifications)
  .post(createCertification);

router.route('/:id')
  .get(getCertificationById)
  .put(updateCertification)
  .delete(deleteCertification);

module.exports = router;
