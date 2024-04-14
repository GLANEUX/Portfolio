const Experience = require('../models/experienceModel');
const Skills = require('../models/skillModel');

//! POST /experience
//! Crée une Experience
exports.createExperience = async (req, res) => {
  try {
    // Extraire les données de la requête POST en supprimant les espaces avant et après (trim)
    let { company, job_title, details, skills, start_date, end_date } = req.body;

    // Vérifier si les champs obligatoires sont présents dans la requête
    if (!company || company.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: company' });
    }

    // Vérifier si les champs obligatoires sont présents dans la requête
    if (!job_title || job_title.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: job_title' });
    }


    // Vérifier si les champs obligatoires sont présents dans la requête
    if (!start_date || start_date.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: start_date' });
    }

    // Vérifier si les champs obligatoires sont présents dans la requête
    if (!end_date || end_date.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: end_date' });
    }



    // Vérifier si Experiences est fourni 
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

    // Créer une nouvelle instance de Experience avec les données
    const newExperience = new Experience({
      company: company.trim(),
      job_title: job_title !== undefined ? (job_title.trim() !== "" ? job_title.trim() : undefined) : job_title,
      details: details !== undefined ? (details.trim() !== "" ? details.trim() : undefined) : details,
      skills: skills !== undefined ? (Array.isArray(skills) ? skills.filter(id => id.trim() !== '')/* trim() ne mache pas */ : [skills.trim()]) : null,
      start_date: start_date.trim(),
      end_date: end_date.trim()
    });

    // Enregistrer la nouvelle Experience dans la base de données
    const experience = await newExperience.save();

    // Répondre avec la nouvelle Experience créée
    res.status(201).json(experience);
  } catch (err) {
    // Gérer les erreurs
    console.error(err);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

//! GET /experiences
// Récupère toutes les experiences
exports.getAllExperiences = async (req, res) => {
  try {
    // Trouver toutes les experiences dans la base de données
    const experiences = await Experience.find();

    if (!experiences) {
      return res.status(404).json({ error: 'Aucune éducation pour le moment' });
    }

    // Répondre avec les experiences trouvées
    res.status(200).json(experiences);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};


// GET /experience/:id
// Récupère une experience par son ID
exports.getExperienceById = async (req, res) => {
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
    // Rechercher la experience dans la base de données par son ID
    const experience = await Experience.findById(req.params.id);

    // Vérifier si la experience existe
    if (!experience) {
      // Si la experience n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'experience not found' });
    }

    // Si la experience est trouvée, renvoyer une réponse avec la experience
    res.status(200).json(experience);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

//! DELETE /experience/:id
//! Supprime une experience par son ID
exports.deleteExperience = async (req, res) => {
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
    // Rechercher la experience à supprimer dans la base de données par son ID et la supprimer
    const experience = await Experience.findById(req.params.id);
    // Vérifier si la experience existe
    if (!experience) {
      // Si la experience n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'Experience not found' });
    }


    await Experience.findByIdAndDelete(req.params.id);

    // Si la experience est trouvée et supprimée avec succès, renvoyer une réponse avec le code 200
    res.status(200).send(`${experience.company} deleted`);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

//! PATCH /experience/:id
//! Modifie un projet par son ID
exports.updateExperience = async (req, res) => {
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
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Initialiser un objet pour stocker les champs mis à jour
    let updatedFields = {};

    // Vérifier si le champ 'company' est fourni et est de type chaîne de caractères non vide
    if (req.body.company !== undefined && req.body.company.trim() !== '') {
      updatedFields.company = req.body.company.trim();
    } else {
      return res.status(400).json({ error: 'Company ne peux pas être vide' });
    }

    // Vérifier si le champ 'company' est fourni et est de type chaîne de caractères non vide
    if (req.body.job_title !== undefined && req.body.job_title.trim() !== '') {
      updatedFields.job_title = req.body.job_title.trim();
    } else {
      return res.status(400).json({ error: 'job_title ne peux pas être vide' });
    }

    // Vérifier si le champ 'end_date' est fourni et est de type chaîne de caractères non vide
    if (req.body.end_date !== undefined && req.body.end_date.trim() !== '') {
      updatedFields.end_date = req.body.end_date.trim();
    }else {
      return res.status(400).json({ error: 'end date doit être spécifier' });
    }
    // Vérifier si le champ 'start_date' est fourni et est de type chaîne de caractères non vide
    if (req.body.start_date !== undefined && req.body.start_date.trim() !== '') {
      updatedFields.start_date = req.body.start_date.trim();
    }else {
      return res.status(400).json({ error: 'start date doit être spécifier' });
    }

    updatedFields.job_title = req.body.job_title ? req.body.job_title.trim() : req.body.job_title
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
    
    // Mettre à jour le projet avec les champs mis à jour
    const updatedExperience = await Experience.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    // Répondre avec le projet mis à jour
    res.status(200).json(updatedExperience);
  } catch (error) {
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};
