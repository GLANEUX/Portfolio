const SkillCategory = require('../models/skillCategoryModel');

// POST /skillCategory
// Crée une skillCategory
exports.createSkillCategory = async (req, res) => {
    try {
      // Vérifier si les champs obligatoires sont présents dans la requête
      if (!req.body.name) {
        return res.status(400).json({ error: 'Missing required parameters: name' });
      }
  
      // Extraire les données de la requête POST en supprimant les espaces avant et après (trim)
      const name = req.body.name.trim();
  
      // Créer une nouvelle instance de SkillCategory avec les données
      const newSkillCategory = new SkillCategory({
        name
      });
  
      // Enregistrer la nouvelle skillCategory dans la base de données
      const skillCategory = await newSkillCategory.save();
  
      // Répondre avec la nouvelle skillCategory créée
      res.status(201).json(skillCategory);
    } catch (err) {
      // Gérer les erreurs
      console.error(error);
      // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
      res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
  };
  
  // GET /skillCategorys
  // Récupère toutes les skillCategorys
  exports.getAllSkillCategorys = async (req, res) => {
    try {
      // Trouver toutes les skillCategorys dans la base de données
      const skillCategorys = await SkillCategory.find();
      
      // Répondre avec les skillCategorys trouvées
      res.status(200).json(skillCategorys);
    } catch (error) {
      // Gérer les erreurs
      console.error(error);
      // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
      res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
  };
  // PUT /skillCategory/:id
// Modifie une skillCategory par son ID
exports.updateSkillCategory = async (req, res) => {
  try {
    // Rechercher la skillCategory à mettre à jour
    const skillCategory = await SkillCategory.findById(req.params.id);
    if (!skillCategory) {
      return res.status(404).json({ error: 'SkillCategory not found' });
    }

    // Initialiser un objet pour stocker les champs mis à jour
    let updatedFields = {};

    // Vérifier si le champ 'name' est fourni et n'est pas vide
    if (req.body.name !== undefined && typeof req.body.name === 'string') {
      const trimmedName = req.body.name.trim();
      if (trimmedName !== '') {
        updatedFields.name = trimmedName;
      }
    }

    // Mettre à jour la skillCategory avec les champs mis à jour
    const updatedSkillCategory = await SkillCategory.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    // Répondre avec la skillCategory mise à jour
    res.status(200).json(updatedSkillCategory);
  } catch (error) {
    console.error(error);
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

  
  // GET /skillCategory/:id
  // Récupère une skillCategory par son ID
  exports.getSkillCategoryById = async (req, res) => {
    try {
      // Rechercher la skillCategory dans la base de données par son ID
      const skillCategory = await SkillCategory.findById(req.params.id);
      
      // Vérifier si la skillCategory existe
      if (!skillCategory) {
        // Si la skillCategory n'est pas trouvée, renvoyer une réponse avec le code 404
        return res.status(404).json({ error: 'SkillCategory not found' });
      }
      
      // Si la skillCategory est trouvée, renvoyer une réponse avec la skillCategory
      res.status(200).json(skillCategory);
    } catch (error) {
      // Gérer les erreurs
      console.error(error);
      res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
  };
  
  // DELETE /skillCategory/:id
  // Supprime une skillCategory par son ID
  exports.deleteSkillCategory = async (req, res) => {
    try {
      // Rechercher la skillCategory à supprimer dans la base de données par son ID et la supprimer
      const skillCategory = await SkillCategory.findByIdAndDelete(req.params.id);
      
      // Vérifier si la skillCategory existe
      if (!skillCategory) {
        // Si la skillCategory n'est pas trouvée, renvoyer une réponse avec le code 404
        return res.status(404).json({ error: 'SkillCategory not found' });
      }
      
      // Si la skillCategory est trouvée et supprimée avec succès, renvoyer une réponse avec le code 200
      res.status(200).send('SkillCategory deleted');
    } catch (error) {
      // Gérer les erreurs
      console.error(error);
      // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
      res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
  };
  