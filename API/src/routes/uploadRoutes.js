const express = require('express');
const router = express.Router();
const fileUploadMiddleware = require('../middleware/fileUploadMiddleware');
const uploadController = require('../controllers/uploadController');

// Route pour gérer l'upload de fichiers
router.post('/upload', fileUploadMiddleware, uploadController.uploadFile);

module.exports = router;
