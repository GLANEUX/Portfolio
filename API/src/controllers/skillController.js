const Skill = require('../models/skillModel');
const SkillCategory = require('../models/skillCategoryModel')
const Project = require('../models/projectModel');
const Experience = require('../models/experienceModel');
const Education = require('../models/educationModel');

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
      const notFoundIds = [];
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
            // Si la catégorie n'est pas trouvée, ajouter à la liste des IDs invalides
            notFoundIds.push(trimmedId);
          } else {
            hasValidCategory = true; // Mettre le flag à true si une catégorie de compétences valide est trouvée
          }
        }
      }
      if (invalidIds.length > 0) {
        // Si des identifiants invalides sont trouvés, renvoyer une erreur
        return res.status(400).json({ error: `Invalid skillCategory IDs: ${invalidIds.join(', ')}` });
      }
      if (notFoundIds.length > 0) {
        // Si des IDs n'existent pas dans la base de données, renvoyer une erreur avec les IDs non trouvés
        return res.status(400).json({ error: `SkillCategory IDs not found: ${notFoundIds.join(', ')}` });
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

// PATCH /skill/:id
// Modifie une skill par son ID
exports.updateSkill = async (req, res) => {
  try {

    // Recherche si l'id est vide
    if (req.params.id == undefined || req.params.id.trim() == "") {
      return res.status(400).json({ error: 'Empty' });
    }
    // Recherche si l'id est correcte
    const skillIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!skillIdRegex.test(req.params.id.trim())) {
      return res.status(400).json({ error: 'Not an ID' });

    }

    // Rechercher la skill à mettre à jour
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Initialiser un objet pour stocker les champs mis à jour
    let updatedFields = {};

    // Vérifier si le champ 'name' est fourni et est de type chaîne de caractères non vide
    if (req.body.name !== undefined && typeof req.body.name === 'string' && req.body.name.trim() !== '') {
      updatedFields.name = req.body.name.trim();
    }

    // Vérifier si le champ 'logo' est fourni et est de type chaîne de caractères non vide
    if (req.body.logo !== undefined && typeof req.body.logo === 'string' && req.body.logo.trim() !== '') {
      const processedLogo = req.body.logo.trim().replace(/ /g, '_');
      const logoRegex = /[^.\s][a-zA-Z0-9\s-]*\.(jpg|png)$/i;
      if (logoRegex.test(processedLogo)) {
        updatedFields.logo = processedLogo;
      } else {
        return res.status(400).json({ error: 'Logo must be a URL with .jpg or .png extension and contain a name' });
      }
    }






    // Vérifier si le champ 'rating' est fourni et est un nombre valide entre 0 et 100
    if (req.body.rating !== undefined) {
      const rating = parseFloat(req.body.rating);
      if (rating >= 0 && rating <= 100 && !isNaN(req.body.rating)) {
        updatedFields.rating = rating;
      } else {
        return res.status(400).json({ error: 'Invalid rating. Rating must be a number between 0 and 100' });
      }
    }


    let skillCategory = req.body.skillCategory;


    if (skillCategory === "null") {
      updatedFields.skillCategory = null;
    } else {

      // Vérifier si skillCategory est fourni
      if (skillCategory !== undefined) {
        // Si skillCategory n'est pas un tableau, le transformer en tableau
        const categories = Array.isArray(skillCategory) ? skillCategory : [skillCategory];
        const categoryIdRegex = /^[0-9a-fA-F]{24}$/;

        // Ensemble pour stocker les ID déjà rencontrés
        const seenIds = new Set();
        // Liste pour stocker les IDs en double
        const duplicateIds = [];
        // Liste pour stocker les IDs non trouvés dans la base de données
        const notFoundIds = [];

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
              // Si la catégorie n'est pas trouvée, ajouter à la liste des IDs non trouvés
              notFoundIds.push(trimmedId);
            } else {
              hasValidCategory = true; // Mettre le flag à true si une catégorie de compétences valide est trouvée
            }
          }
        }
        if (invalidIds.length > 0) {
          // Si des identifiants invalides sont trouvés, renvoyer une erreur avec les IDs invalides
          return res.status(400).json({ error: `Invalid skillCategory IDs: ${invalidIds.join(', ')}` });
        }
        if (duplicateIds.length > 0) {
          // Si des IDs en double sont trouvés, renvoyer une erreur différente avec les IDs en double
          return res.status(400).json({ error: `Duplicate skillCategory IDs: ${duplicateIds.join(', ')}` });
        }
        if (notFoundIds.length > 0) {
          // Si des IDs n'existent pas dans la base de données, renvoyer une erreur avec les IDs non trouvés
          return res.status(400).json({ error: `SkillCategory IDs not found: ${notFoundIds.join(', ')}` });
        }
        if (!hasValidCategory) {
          // Si aucune catégorie de compétences valide n'est trouvée, définir skillCategory à undefined
          skillCategory = undefined;
        } else {
          // Filtrer les identifiants vides et mettre à jour les catégories
          updatedFields.skillCategory = categories.filter(id => id.trim() !== '');
        }
      } else {
        skillCategory = undefined;
      }
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
    // Recherche si l'id est vide
    if (req.params.id == undefined || req.params.id.trim() == "") {
      return res.status(400).json({ error: 'Empty' });
    }
    // Recherche si l'id est correcte
    const skillIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!skillIdRegex.test(req.params.id.trim())) {
      return res.status(400).json({ error: 'Not an ID' });

    }

    // Vérifier si la skill existe
    if (!skill) {
      // Si la skill n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'Skill not found' });
    }
    // Rechercher la skill dans la base de données par son ID
    const skill = await Skill.findById(req.params.id);

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

    // Recherche si l'id est vide
    if (req.params.id == undefined || req.params.id.trim() == "") {
      return res.status(400).json({ error: 'Empty' });
    }
    // Recherche si l'id est correcte
    const skillIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!skillIdRegex.test(req.params.id.trim())) {
      return res.status(400).json({ error: 'Not an ID' });

    }


    // Vérifier si la skill existe
    if (!skill) {
      // Si la skill n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'Skill not found' });
    }
    // Rechercher la skill à supprimer dans la base de données par son ID et la supprimer
    const skill = await Skill.findByIdAndDelete(req.params.id);

    // Si la skill est trouvée et supprimée avec succès, renvoyer une réponse avec le code 200
    res.status(200).send('Skill deleted');
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

// GET /skill/:id/projets
// Récupère tout les projets depuis une skill
exports.getAllProjectsFromSkill = async (req, res) => {
  try {


    // Recherche si l'id est vide
    if (req.params.id == undefined || req.params.id.trim() == "") {
      return res.status(400).json({ error: 'Empty' });
    }
    // Recherche si l'id est correcte
    const skillIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!skillIdRegex.test(req.params.id.trim())) {
      return res.status(400).json({ error: 'Not an ID' });

    }

    const skillId = req.params.id;

    // Vérifier si la skill existe
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Trouver tous les projets avec la catégorie spécifiée
    const projects = await Project.find({ skills: skillId });

    // Vérifier si des projets ont été trouvés
    if (projects.length === 0) {
      return res.status(404).json({ error: 'No projects found for the specified skill' });
    }

    // Répondre avec les projets trouvées
    res.status(200).json(projects);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

// GET /skill/:id/experiences
// Récupère toutes les experiences depuis une skill
exports.getAllExperiencesFromSkill = async (req, res) => {
  try {

    // Recherche si l'id est vide
    if (req.params.id == undefined || req.params.id.trim() == "") {
      return res.status(400).json({ error: 'Empty' });
    }
    // Recherche si l'id est correcte
    const skillIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!skillIdRegex.test(req.params.id.trim())) {
      return res.status(400).json({ error: 'Not an ID' });

    }


    const skillId = req.params.id;

    // Vérifier si la skill existe
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Trouver tous les projets avec la catégorie spécifiée
    const experiences = await Experience.find({ skills: skillId });

    // Vérifier si des projets ont été trouvés
    if (experiences.length === 0) {
      return res.status(404).json({ error: 'No experiences found for the specified skill' });
    }

    // Répondre avec les projets trouvées
    res.status(200).json(experiences);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};


// GET /skill/:id/educations
// Récupère toutes les educations depuis une skill
exports.getAllEducationsFromSkill = async (req, res) => {
  try {

    // Recherche si l'id est vide
    if (req.params.id == undefined || req.params.id.trim() == "") {
      return res.status(400).json({ error: 'Empty' });
    }
    // Recherche si l'id est correcte
    const skillIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!skillIdRegex.test(req.params.id.trim())) {
      return res.status(400).json({ error: 'Not an ID' });

    }

    const skillId = req.params.id;

    // Vérifier si la skill existe
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Trouver tous les projets avec la catégorie spécifiée
    const educations = await Education.find({ skills: skillId });

    // Vérifier si des projets ont été trouvés
    if (educations.length === 0) {
      return res.status(404).json({ error: 'No educations found for the specified skill' });
    }

    // Répondre avec les projets trouvées
    res.status(200).json(educations);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};
