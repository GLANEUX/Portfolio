const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const multer = require('multer');


// Configuration de multer pour stocker temporairement les fichiers
const upload = multer({ storage: multer.memoryStorage() });

// POST /skill
router.post('/project', upload.any('file'), projectController.createProject);


// /projects
router
  .route('/projects')
  .get(projectController.getAllProjects)


// /project/:id
router
  .route('/project/:id')
  .get(projectController.getProjectById)
  .patch(upload.any('file'), projectController.updateProject)
  .delete(projectController.deleteProject);

module.exports = router;

