const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const multer = require('multer');


// Définir le stockage pour multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});


// Initialiser multer avec les options de stockage
const upload = multer({ storage: storage });

// Définir la route pour gérer l'upload de fichiers
router.post('/upload', upload.single('file'), skillController.uploadFile);




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

  router
  .route('/skill/:id/educations')
  .get(skillController.getAllEducationsFromSkill);
module.exports = router;


