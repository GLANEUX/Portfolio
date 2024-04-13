const Certification = require('../models/certificationModel');
const Skills = require('../models/skillModel');


//! POST /certification
//! Crée une certification
exports.createCertification = async (req, res) => {
  try {

    // Extraire les données de la requête POST en supprimant les espaces avant et après (trim)
    let { name, details, skills, date } = req.body;

    // Vérifier si les champs obligatoires sont présents dans la requête
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: name' });
    }

    // Vérifier si les champs obligatoires sont présents dans la requête
    if (!date || date.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: date' });
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

      let hasValidSkill = false; // Flag pour indiquer si au moins une skill valide est trouvée
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
            hasValidSkill = true; // Mettre le flag à true si une skill valide est trouvée
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
        // Si aucune skill valide n'est trouvée, définir skills à undefined
        skills = undefined;
      }
    }

    // Créer une nouvelle instance de Education avec les données
    const newCertification = new Certification({
      name: name.trim(),
      details: details !== undefined ? (details.trim() !== "" ? details.trim() : undefined) : details,
      skills: skills !== undefined ? (Array.isArray(skills) ? skills.filter(id => id.trim() !== '')/* trim() ne mache pas */ : [skills.trim()]) : null,
      date: date.trim()
    });


    // Enregistrer la nouvelle certification dans la base de données
    const certification = await newCertification.save();

    // Répondre avec la nouvelle certification créée
    res.status(201).json(certification);
  } catch (err) {
    // Gérer les erreurs
    console.error(err);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ err: 'An unexpected error occurred on the server.' });
  }
};

//! GET /certifications
//! Récupère toutes les certifications
exports.getAllCertifications = async (req, res) => {
  try {
    // Trouver toutes les certifications dans la base de données
    const certifications = await Certification.find();

    if (!certifications) {
      return res.status(404).json({ error: 'Aucune certifications pour le moment' });
    }
    // Répondre avec les certifications trouvées
    res.status(200).json(certifications);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

// GET /certification/:id
// Récupère une certification par son ID
exports.getCertificationById = async (req, res) => {
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
    // Rechercher la certification dans la base de données par son ID
    const certification = await Certification.findById(req.params.id);
    // Vérifier si la certification existe
    if (!certification) {
      // Si la certification n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'Certification not found' });
    }


    // Si la certification est trouvée, renvoyer une réponse avec la certification
    res.status(200).json(certification);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

//! DELETE /certification/:id
//! Supprime une certification par son ID
exports.deleteCertification = async (req, res) => {
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
    const certification = await Certification.findById(req.params.id);

    // Vérifier si la certification existe
    if (!certification) {
      // Si la certification n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'Certification not found' });
    }
    // Rechercher la certification à supprimer dans la base de données par son ID et la supprimer
  await Certification.findByIdAndDelete(req.params.id);

    // Si la certification est trouvée et supprimée avec succès, renvoyer une réponse avec le code 200
    res.status(200).send(`${certification.name} deleted`);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

//! PATCH /certification/:id
//! Modifie une certification par son ID
exports.updateCertification = async (req, res) => {
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
    // Rechercher la certification à mettre à jour
    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    // Initialiser un objet pour stocker les champs mis à jour
    let updatedFields = {};

    // Vérifier si le champ 'name' est fourni et est de type chaîne de caractères non vide
    if (req.body.name !== undefined && req.body.name.trim() !== '') {
      updatedFields.name = req.body.name.trim();
    } else {
      return res.status(400).json({ error: 'name ne peux pas être vide' });
    }

    // Vérifier si le champ 'date' est fourni et est de type chaîne de caractères non vide
    if (req.body.date !== undefined && req.body.date.trim() !== '') {
      updatedFields.date = req.body.date.trim();
    } else {
      return res.status(400).json({ error: 'date ne peux pas être vide' });
    }

    updatedFields.details = req.body.details ? req.body.details.trim() : req.body.details


    let skills = req.body.skills;

    if (skills.length === 0) {
      skills = undefined;
    }
    
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
        let hasValidCategory = false; // Flag pour indiquer si au moins une skill valide est trouvée
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
              hasValidCategory = true; // Mettre le flag à true si une skill valide est trouvée
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
          // Si aucune skill valide n'est trouvée, définir skillCategory à undefined
          updatedFields.skills = undefined;
        } else {
          // Filtrer les identifiants vides et mettre à jour les catégories
          updatedFields.skills = categories.filter(id => id.trim() !== '');

        }
      } else {
        updatedFields.skills = null;
      }
    
    // Mettre à jour la certification avec les champs mis à jour
    const updatedCertification = await Certification.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    // Répondre avec la certification mise à jour
    res.status(200).json(updatedCertification);
  } catch (error) {
    console.error(error);
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};