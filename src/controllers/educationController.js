const Education = require('../models/educationModel');
const Skills = require('../models/skillModel');


// POST /education
// Crée une Education
exports.createEducation = async (req, res) => {
  try {
    // Extraire les données de la requête POST en supprimant les espaces avant et après (trim)
    let { school, program, details, skills } = req.body;

    // Vérifier si les champs obligatoires sont présents dans la requête
    if (!school || school.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: school' });
    }

    // Vérifier si Educations est fourni 
    if (skills !== undefined) {
      // Si skills n'est pas un tableau, le transformer en tableau
      const categories = Array.isArray(skills) ? skills : [skills];
      const skillIdRegex = /^[0-9a-fA-F]{24}$/;

      // Ensemble pour stocker les ID déjà rencontrés
      const seenIds = new Set();
      // Liste pour stocker les IDs en double
      const duplicateIds = [];

      // Vérifier que chaque ID de skills existe et est valide
      const invalidIds = [];
      const notFoundIds = [];

      let hasValidSkill = false; // Flag pour indiquer si au moins une catégorie de compétences valide est trouvée
      for (const skillId of categories) {
        const trimmedId = skillId.trim();
        if (trimmedId === '') {
          // Si l'ID est vide, ignorer cette itération
          continue;
        } else if (!skillIdRegex.test(trimmedId)) {
          // Vérifier si l'ID correspond au format attendu
          invalidIds.push(trimmedId);
        } else if (seenIds.has(trimmedId)) {
          // Si l'ID est déjà présent dans l'ensemble, ajouter à la liste des IDs en double
          duplicateIds.push(trimmedId);
        } else {
          // Ajouter l'ID à l'ensemble des ID déjà rencontrés
          seenIds.add(trimmedId);
          const skill = await Skills.findById(trimmedId);
          if (!skill) {
            // Si la catégorie n'est pas trouvée, ajouter à la liste des IDs invalides
            notFoundIds.push(trimmedId);
          } else {
            hasValidSkill = true; // Mettre le flag à true si une catégorie de compétences valide est trouvée
          }
        }
      }
      if (invalidIds.length > 0) {
        // Si des identifiants invalides sont trouvés, renvoyer une erreur
        return res.status(400).json({ error: `Invalid skills IDs: ${invalidIds.join(', ')}` });
      }
      if (notFoundIds.length > 0) {
        // Si des IDs n'existent pas dans la base de donn ées, renvoyer une erreur avec les IDs non trouvés
        return res.status(400).json({ error: `skills IDs not found: ${notFoundIds.join(', ')}` });
      }
      if (duplicateIds.length > 0) {
        // Si des IDs en double sont trouvés, renvoyer une erreur différente
        return res.status(400).json({ error: `Duplicate skills IDs: ${duplicateIds.join(', ')}` });
      }
      if (!hasValidSkill) {
        // Si aucune catégorie de compétences valide n'est trouvée, définir skills à undefined
        skills = undefined;
      }
    }


    // Créer une nouvelle instance de Education avec les données
    const newEducation = new Education({
      school: school.trim(),
      program: program !== undefined ? (program.trim() !== "" ? program.trim() : undefined) : program,
      details: details !== undefined ? (details.trim() !== "" ? details.trim() : undefined) : details,
      skills: skills !== undefined ? (Array.isArray(skills) ? skills.filter(id => id.trim() !== '')/* trim() ne mache pas */ : [skills.trim()]) : null
    });

    // Enregistrer la nouvelle Education dans la base de données
    const skill = await newEducation.save();

    // Répondre avec la nouvelle Education créée
    res.status(201).json(skill);
  } catch (err) {
    // Gérer les erreurs
    console.error(err);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

// GET /educations
// Récupère toutes les educations
exports.getAllEducations = async (req, res) => {
  try {
    // Trouver toutes les educations dans la base de données
    const educations = await Education.find();

    // Répondre avec les educations trouvées
    res.status(200).json(educations);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};
// GET /education/:id
// Récupère une education par son ID
exports.getEducationById = async (req, res) => {
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
    // Rechercher la education dans la base de données par son ID
    const education = await Education.findById(req.params.id);

    // Vérifier si la education existe
    if (!education) {
      // Si la education n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'education not found' });
    }

    // Si la education est trouvée, renvoyer une réponse avec la education
    res.status(200).json(education);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

// DELETE /education/:id
// Supprime une education par son ID
exports.deleteEducation = async (req, res) => {
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


    // Vérifier si la education existe
    if (!education) {
      // Si la education n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'Education not found' });
    }
    // Rechercher la education à supprimer dans la base de données par son ID et la supprimer
    const education = await Education.findByIdAndDelete(req.params.id);
    // Si la education est trouvée et supprimée avec succès, renvoyer une réponse avec le code 200
    res.status(200).send('Education deleted');
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

//Perfectionner
// PATCH /education/:id
// Modifie un projet par son ID
exports.updateEducation = async (req, res) => {
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

    // Rechercher le projet à mettre à jour
    const education = await Education.findById(req.params.id);
    if (!education) {
      return res.status(404).json({ error: 'Education not found' });
    }

    // Initialiser un objet pour stocker les champs mis à jour
    let updatedFields = {};

    // Vérifier si le champ 'school' est fourni et est de type chaîne de caractères non vide
    if (req.body.school !== undefined && req.body.school.trim() !== '') {
      updatedFields.school = req.body.school.trim();
    }

    // Vérifier si le champ 'program' est fourni et est de type chaîne de caractères non vide
    if (req.body.program !== undefined && req.body.program.trim() !== '') {
      if (req.body.program.trim() == "delete") {
        // Utiliser l'opérateur $unset de Mongoose pour supprimer le champ program
        updatedFields.$unset = { program: "" };
      } else {
        updatedFields.program = req.body.program.trim();
      }
    }


    // Vérifier si le champ 'details' est fourni et est de type chaîne de caractères non vide
    if (req.body.details !== undefined && req.body.details.trim() !== '') {
      if (req.body.details.trim() == "delete") {
        // Utiliser l'opérateur $unset de Mongoose pour supprimer le champ shortDescription
        updatedFields.$unset = { details: "" };
      } else {
        updatedFields.details = req.body.details.trim();
      }
    }


    let skills = req.body.skills;
    // Vérifier si le champ 'skills' est fourni
    if (skills === "null") {
      updatedFields.skills = null;
    } else {

      // Vérifier si skillCategory est fourni
      if (skills !== undefined) {
        // Si skillCategory n'est pas un tableau, le transformer en tableau
        const categories = Array.isArray(skills) ? skills : [skills];
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
            const category = await Skills.findById(trimmedId);
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
          return res.status(400).json({ error: `Invalid skill IDs: ${invalidIds.join(', ')}` });
        }
        if (duplicateIds.length > 0) {
          // Si des IDs en double sont trouvés, renvoyer une erreur différente avec les IDs en double
          return res.status(400).json({ error: `Duplicate skill IDs: ${duplicateIds.join(', ')}` });
        }
        if (notFoundIds.length > 0) {
          // Si des IDs n'existent pas dans la base de données, renvoyer une erreur avec les IDs non trouvés
          return res.status(400).json({ error: `Skill IDs not found: ${notFoundIds.join(', ')}` });
        }
        if (!hasValidCategory) {
          // Si aucune catégorie de compétences valide n'est trouvée, définir skillCategory à undefined
          skills = undefined;
        } else {
          // Filtrer les identifiants vides et mettre à jour les catégories
          updatedFields.skills = categories.filter(id => id.trim() !== '');

        }
      } else {
        skills = undefined;
      }
    }

    // Mettre à jour le projet avec les champs mis à jour
    const updatedEducation = await Education.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    // Répondre avec le projet mis à jour
    res.status(200).json(updatedEducation);
  } catch (error) {
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};
