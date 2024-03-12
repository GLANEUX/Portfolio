const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certificationController');

// /certifications
router
  .route('/certifications')
  .get(certificationController.getAllCertifications)
  .post(certificationController.createCertification);

// /certifications/:id
router
  .route('/certification/:id')
  .get(certificationController.getCertificationById)
  .put(certificationController.updateCertification)
  .delete(certificationController.deleteCertification);

module.exports = router;
