const Skill = require('../models/projectModel');
const Project = require('../models/projectModel');

// POST /skill
// Crée une skill
exports.createProject = async (req, res) => {
    try {
      // Extraire les données de la requête POST en supprimant les espaces avant et après (trim)
      const { name, shortDescription } = req.body;
  
      // Vérifier si les champs obligatoires sont présents dans la requête
      if (!name || name.trim() === "") {
        return res.status(400).json({ error: 'Missing required parameters: name' });
      }

      // Vérifier si shortDescription est vide ou constitué uniquement d'espaces
      if (shortDescription && shortDescription.trim() === "") {
        return res.status(400).json({ error: 'Invalid value for shortDescription' });
      }
  
      // Créer une nouvelle instance de Skill avec les données
      const newSkill = new Skill({
        name: name.trim(),
        shortDescription: shortDescription ? shortDescription.trim() : undefined
      });
  
      // Enregistrer la nouvelle skill dans la base de données
      const skill = await newSkill.save();
  
      // Répondre avec la nouvelle skill créée
      res.status(201).json(skill);
    } catch (err) {
      // Gérer les erreurs
      console.error(err);
      // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
      res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
};
