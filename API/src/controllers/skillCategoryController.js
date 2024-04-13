const SkillCategory = require('../models/skillCategoryModel');
const Skill = require('../models/skillModel');

//! POST /skillCategory
//! Crée une skillCategory
exports.createSkillCategory = async (req, res) => {
  try {


    // Extraire les données de la requête POST en supprimant les espaces avant et après (trim)
    const name =  req.body.name;

     // Vérifier si les champs obligatoires sont présents dans la requête
     if (!name || name.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: name' });
    }

       // Créer une nouvelle instance de SkillCategory avec les données
    const newSkillCategory = new SkillCategory({
      name: name.trim
    });

    // Enregistrer la nouvelle skillCategory dans la base de données
    const skillCategory = await newSkillCategory.save();

    // Répondre avec la nouvelle skillCategory créée
    res.status(201).json(skillCategory);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

//! GET /skillCategorys
//! Récupère toutes les skillCategorys
exports.getAllSkillCategorys = async (req, res) => {
  try {
    // Trouver toutes les skillCategorys dans la base de données
    const skillCategorys = await SkillCategory.find();
    if (!skillCategorys) {
      return res.status(404).json({ error: 'Aucune certifications pour le moment' });
    }
    // Répondre avec les skillCategorys trouvées
    res.status(200).json(skillCategorys);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

//! PATCH /skillCategory/:id
//! Modifie une skillCategory par son ID
exports.updateSkillCategory = async (req, res) => {
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

    // Rechercher la skillCategory à mettre à jour
    const skillCategory = await SkillCategory.findById(req.params.id);
    if (!skillCategory) {
      return res.status(404).json({ error: 'SkillCategory not found' });
    }

    // Initialiser un objet pour stocker les champs mis à jour
    let updatedFields = {};

    // Vérifier si le champ 'name' est fourni et est de type chaîne de caractères non vide
    if (req.body.name !== undefined && req.body.name.trim() !== '') {
      updatedFields.name = req.body.name.trim();
    } else {
      return res.status(400).json({ error: 'name ne peux pas être vide' });
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
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

//! GET /skillCategory/:id
//! Récupère une skillCategory par son ID
exports.getSkillCategoryById = async (req, res) => {
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

//! DELETE /skillCategory/:id
//! Supprime une skillCategory par son ID
exports.deleteSkillCategory = async (req, res) => {
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

    const skillCategory = await SkillCategory.findById(req.params.id);

    // Vérifier si la certification existe
    if (!skillCategory) {
      // Si la certification n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'SkillCategory not found' });
    }


    

    // Recherche de toutes les compétences qui ont cette catégorie de compétences
    const skillsToUpdate = await Skill.find({ skillCategory: req.params.id });
    console.log(skillsToUpdate.length)

     // Parcourez chaque compétence et supprimez l'ID de la catégorie de compétences à supprimer
     for (const skill of skillsToUpdate) {
      skill.skillCategory = skill.skillCategory.filter(id => id !== req.params.id); // Supprimer l'ID de la catégorie de compétences
      if (skill.skillCategory.length === 0) {
        skill.skillCategory = null; // Mettre à null si le tableau devient vide
      }
      await skill.save(); // Enregistrer la compétence mise à jour
    }


    // Rechercher la certification à supprimer dans la base de données par son ID et la supprimer
  await SkillCategory.findByIdAndDelete(req.params.id);


    // Si la skillCategory est trouvée et supprimée avec succès, renvoyer une réponse avec le code 200
    res.status(200).send(`${skillCategory.name} deleted`);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

// GET /skillCategory/:id/skills
// Récupère toutes les skill depuis une skillcategory
exports.getAllSkillsFromCategory = async (req, res) => {
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

    const categoryId = req.params.id;

    // Vérifier si la skillCategory existe
    const category = await SkillCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'SkillCategory not found' });
    }

    // Trouver tous les skills avec la catégorie spécifiée
    const skills = await Skill.find({ skillCategory: categoryId });

    // Vérifier si des skills ont été trouvées
    if (skills.length === 0) {
      return res.status(404).json({ error: 'No skills found for the specified category' });
    }

    // Répondre avec les skills trouvées
    res.status(200).json(skills);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};
