const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');

// /experience
router
  .route('/experience')
  .post(experienceController.createExperience);

// /experiences
router
  .route('/experiences')
  .get(experienceController.getAllExperiences);


// /skill/:id
router
  .route('/experience/:id')
  .get(experienceController.getExperienceById)
  .patch(experienceController.updateExperience)
  .delete(experienceController.deleteExperience);



module.exports = router;

