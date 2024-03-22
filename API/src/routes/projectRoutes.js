const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// /project
router
  .route('/project')
  .post(projectController.createProject);

// /projects
router
  .route('/projects')
  .get(projectController.getAllProjects)


// /project/:id
router
  .route('/project/:id')
  .get(projectController.getProjectById)
  .patch(projectController.updateProject)
  .delete(projectController.deleteProject);

module.exports = router;

