

// Méthode pour gérer l'upload de fichiers
exports.uploadFile = (req, res) => {

  // Vérifier s'il y a un fichier dans la requête
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier n\'a été sélectionné' });
  }

  res.status(200).json({ message: 'Fichier téléchargé avec succès' });

};