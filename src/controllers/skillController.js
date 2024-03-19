const Skill = require('../models/skillModel');
const SkillCategory = require('../models/skillCategoryModel')
// POST /skill
// Crée une skill
exports.createSkill = async (req, res) => {
  try {

    // Extraire les données de la requête POST en supprimant les espaces avant et après (trim)
    let { name, logo, rating, skillCategory } = req.body;

    // Vérifier si les champs obligatoires sont présents dans la requête
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: name' });
    }

  // Vérifier si le logo est fourni et s'il a une extension .jpg ou .png
  const logoRegex = /[^.\s][a-zA-Z0-9\s-]*\.(jpg|png)$/i;
  if (logo) {
    // Remplacer les espaces par des underscores dans le logo
    const processedLogo = logo.trim().replace(/ /g, '_');
    // Vérifier si le logo a une extension valide
    if (!logoRegex.test(processedLogo)) {
      return res.status(400).json({ error: 'Logo must be a URL with .jpg or .png extension and contain a name' });
    }
  }

    // Vérifier si le rating est valide (compris entre 0 et 100)
    if (rating !== undefined && (isNaN(rating) || rating < 0 || rating > 100)) {
      return res.status(400).json({ error: 'Invalid rating. Rating must be a number between 0 and 100' });
    }
// Vérifier si skillCategory est fourni 
if (skillCategory !== undefined) {
  // Si skillCategory n'est pas un tableau, le transformer en tableau
  const categories = Array.isArray(skillCategory) ? skillCategory : [skillCategory];
  const categoryIdRegex = /^[0-9a-fA-F]{24}$/;

  // Ensemble pour stocker les ID déjà rencontrés
  const seenIds = new Set();
  // Liste pour stocker les IDs en double
  const duplicateIds = [];

  // Vérifier que chaque ID de skillCategory existe
  const invalidIds = [];
  let hasValidCategory = false; // Flag pour indiquer si au moins une catégorie de compétences valide est trouvée
  for (const categoryId of categories) {
    const trimmedId = categoryId.trim();
    if (trimmedId === '') {
      // Si l'ID est vide, ignorer cette itération
      continue;
    } else if (!categoryIdRegex.test(trimmedId)) {
      // Vérifier si l'ID correspond au format attendu
      invalidIds.push(trimmedId);
    } else if (seenIds.has(trimmedId)) {
      // Si l'ID est déjà présent dans l'ensemble, ajouter à la liste des IDs en double
      duplicateIds.push(trimmedId);
    } else {
      // Ajouter l'ID à l'ensemble des ID déjà rencontrés
      seenIds.add(trimmedId);
      const category = await SkillCategory.findById(trimmedId);
      if (!category) {
        invalidIds.push(trimmedId);
      } else {
        hasValidCategory = true; // Mettre le flag à true si une catégorie de compétences valide est trouvée
      }
    }
  } 
  if (invalidIds.length > 0) {
    // Si des identifiants invalides sont trouvés, renvoyer une erreur
    return res.status(400).json({ error: `Invalid skillCategory IDs: ${invalidIds.join(', ')}` });
  }
  if (duplicateIds.length > 0) {
    // Si des IDs en double sont trouvés, renvoyer une erreur différente
    return res.status(400).json({ error: `Duplicate skillCategory IDs: ${duplicateIds.join(', ')}` });
  }
  if (!hasValidCategory) {
    // Si aucune catégorie de compétences valide n'est trouvée, définir skillCategory à undefined
    skillCategory = undefined;
  }
}


// Créer une nouvelle instance de Skill avec les données
const newSkill = new Skill({
  name: name.trim(),
  logo: logo ? logo.trim().replace(/ /g, '_') : undefined,
  rating,
  skillCategory: skillCategory !== undefined ? (Array.isArray(skillCategory) ? skillCategory.filter(id => id.trim() !== '') : [skillCategory.trim()]) : null
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



// GET /skills
// Récupère toutes les skills
exports.getAllSkills = async (req, res) => {
  try {
    // Trouver toutes les skills dans la base de données
    const skills = await Skill.find();
    
    // Répondre avec les skills trouvées
    res.status(200).json(skills);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

  // GET /skills
  // Récupère toutes les skills
  exports.getAllSkills = async (req, res) => {
    try {
      // Trouver toutes les skills dans la base de données
      const skills = await Skill.find();
      
      // Répondre avec les skills trouvées
      res.status(200).json(skills);
    } catch (error) {
      // Gérer les erreurs
      console.error(error);
      // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
      res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
  };
// PUT /skill/:id
// Modifie une skill par son ID
exports.updateSkill = async (req, res) => {
  try {
    // Rechercher la skill à mettre à jour
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Extraire les données de la requête PUT
    const { name, logo, rating, skillCategory } = req.body;

    // Initialiser un objet pour stocker les champs mis à jour
    let updatedFields = {};

    // Vérifier si le champ 'name' est fourni et n'est pas vide
    if (name !== undefined && typeof name === 'string') {
      const trimmedName = name.trim();
      if (trimmedName !== '') {
        updatedFields.name = trimmedName;
      }
    }

    // Vérifier si le logo est fourni et s'il a une extension .jpg ou .png
    if (logo !== undefined) {
      if (logo.trim() !== '') {
        // Remplacer les espaces par des underscores dans le logo
        const processedLogo = logo.trim().replace(/ /g, '_');
        const logoRegex = /\.(jpg|png)$/i;
        if (!logoRegex.test(processedLogo)) {
          return res.status(400).json({ error: 'Logo must be a URL with .jpg or .png extension' });
        }
        updatedFields.logo = processedLogo;
      } else {
        updatedFields.logo = undefined; // Supprimer le logo si vide
      }
    }

    // Vérifier si le rating est fourni et valide
    if (rating !== undefined) {
      const trimmedRating = parseFloat(rating);
      if (!isNaN(trimmedRating) && trimmedRating >= 0 && trimmedRating <= 100) {
        updatedFields.rating = trimmedRating;
      } else {
        return res.status(400).json({ error: 'Invalid rating. Rating must be a number between 0 and 100' });
      }
    }

    // Vérifier si skillCategory est fourni
    if (skillCategory !== undefined) {
      // Si skillCategory n'est pas un tableau, le transformer en tableau
      const categories = Array.isArray(skillCategory) ? skillCategory : [skillCategory];

      // Vérifier que chaque ID de skillCategory existe
      const invalidIds = [];
      for (const categoryId of categories) {
        const category = await SkillCategory.findById(categoryId);
        if (!category) {
          invalidIds.push(categoryId);
        }
      }
      if (invalidIds.length > 0) {
        return res.status(400).json({ error: `Invalid skillCategory IDs: ${invalidIds.join(', ')}` });
      }

      updatedFields.skillCategory = categories;
    } else {
      updatedFields.skillCategory = null; // Définir skillCategory sur null si aucune valeur n'est fournie
    }

    // Mettre à jour la skill avec les champs mis à jour
    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    // Répondre avec la skill mise à jour
    res.status(200).json(updatedSkill);
  } catch (error) {
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};



  // GET /skill/:id
  // Récupère une skill par son ID
  exports.getSkillById = async (req, res) => {
    try {
      // Rechercher la skill dans la base de données par son ID
      const skill = await Skill.findById(req.params.id);
      
      // Vérifier si la skill existe
      if (!skill) {
        // Si la skill n'est pas trouvée, renvoyer une réponse avec le code 404
        return res.status(404).json({ error: 'Skill not found' });
      }
      
      // Si la skill est trouvée, renvoyer une réponse avec la skill
      res.status(200).json(skill);
    } catch (error) {
      // Gérer les erreurs
      console.error(error);
      res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
  };
  
  // DELETE /skill/:id
  // Supprime une skill par son ID
  exports.deleteSkill = async (req, res) => {
    try {
      // Rechercher la skill à supprimer dans la base de données par son ID et la supprimer
      const skill = await Skill.findByIdAndDelete(req.params.id);
      
      // Vérifier si la skill existe
      if (!skill) {
        // Si la skill n'est pas trouvée, renvoyer une réponse avec le code 404
        return res.status(404).json({ error: 'Skill not found' });
      }
      
      // Si la skill est trouvée et supprimée avec succès, renvoyer une réponse avec le code 200
      res.status(200).send('Skill deleted');
    } catch (error) {
      // Gérer les erreurs
      console.error(error);
      // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
      res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
  };
  