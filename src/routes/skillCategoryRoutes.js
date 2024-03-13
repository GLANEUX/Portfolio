const express = require('express');
const router = express.Router();
const skillCategoryController = require('../controllers/skillCategoryController');

// /skillCategory
router
  .route('/skillCategory')
  .post(skillCategoryController.createSkillCategory);

// /skillCategorys
router
  .route('/skillCategorys')
  .get(skillCategoryController.getAllSkillCategorys)


// /skillCategory/:id
router
  .route('/skillCategory/:id')
  .get(skillCategoryController.getSkillCategoryById)
  .put(skillCategoryController.updateSkillCategory)
  .delete(skillCategoryController.deleteSkillCategory);

module.exports = router;

