const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certificationController');

// /certification
router
  .route('/certification')
  .post(certificationController.createCertification);

// /certifications
router
  .route('/certifications')
  .get(certificationController.getAllCertifications)

// /certifications/:id
router
  .route('/certification/:id')
  .get(certificationController.getCertificationById)
  .put(certificationController.updateCertification)
  .delete(certificationController.deleteCertification);

module.exports = router;
