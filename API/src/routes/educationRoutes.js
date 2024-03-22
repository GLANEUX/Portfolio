const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');

// /education
router
  .route('/education')
  .post(educationController.createEducation);

// /educations
router
  .route('/educations')
  .get(educationController.getAllEducations);


// /skill/:id
router
  .route('/education/:id')
  .get(educationController.getEducationById)
  .patch(educationController.updateEducation)
  .delete(educationController.deleteEducation);



module.exports = router;

