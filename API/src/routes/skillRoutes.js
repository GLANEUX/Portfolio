const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const multer = require('multer');


// Configuration de multer pour stocker temporairement les fichiers
const upload = multer({ storage: multer.memoryStorage() });

// POST /skill
router.post('/skill', upload.single('file'), skillController.createSkill);

// /skills
router
  .route('/skills')
  .get(skillController.getAllSkills);


// /skill/:id
router
  .route('/skill/:id')
  .get(skillController.getSkillById)
  .patch( upload.single('file'), skillController.updateSkill)
  .delete(skillController.deleteSkill);

router
  .route('/skill/:id/projets')
  .get(skillController.getAllProjectsFromSkill);

router
  .route('/skill/:id/experiences')
  .get(skillController.getAllExperiencesFromSkill);

  router
  .route('/skill/:id/educations')
  .get(skillController.getAllEducationsFromSkill);
module.exports = router;


