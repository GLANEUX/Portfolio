const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');

// /skill
router
  .route('/skill')
  .post(skillController.createSkill);

// /skills
router
  .route('/skills')
  .get(skillController.getAllSkills);


// /skill/:id
router
  .route('/skill/:id')
  .get(skillController.getSkillById)
  .patch(skillController.updateSkill)
  .delete(skillController.deleteSkill);

router
  .route('/skill/:id/projets')
  .get(skillController.getAllProjectsFromSkill);

router
  .route('/skill/:id/experiences')
  .get(skillController.getAllExperiencesFromSkill);
module.exports = router;

