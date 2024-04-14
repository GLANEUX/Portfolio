const multer = require('multer');



// Définition du stockage pour multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/uploads/');
  },
  filename: function (req, file, cb) {
    // Générer une suite de nombres aléatoires
    const randomNumbers = Math.random().toString(36).substring(2, 8);
    // Récupérer l'extension du fichier
    const fileExtension = file.originalname.replace(/\s+/g, '_');
    // Vérifier si l'extension est .jpg ou .png

    // Concaténer la suite de nombres avec le nom d'origine du fichier
    const modifiedFileName = `${randomNumbers}-${fileExtension}`;
    
    cb(null, modifiedFileName);
  }
});


// Initialisation de multer avec les options de stockage
const upload = multer({ storage: storage });
// Middleware pour gérer le téléchargement de fichiers
const fileUploadMiddleware = upload.single('file');



module.exports = fileUploadMiddleware;
