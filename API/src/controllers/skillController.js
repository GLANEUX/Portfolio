const SkillCategory = require('../models/skillCategoryModel')
const Skill = require('../models/skillModel');
const Project = require('../models/projectModel');
const Experience = require('../models/experienceModel');
const Education = require('../models/educationModel');
const Certification = require('../models/certificationModel');
const fs = require('fs');
const path = require('path');




//! POST /skill
//! Crée une skill
exports.createSkill = async (req, res) => {
  try {

    // Extraire les données de la requête POST en supprimant les espaces avant et après (trim)
    let { name, rating, skillCategory } = req.body;
    let file = req.file; // Accéder au fichier téléchargé


    // Vérifier si les champs obligatoires sont présents dans la requête
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: name' });
    }

    // Vérifier si le rating est valide (compris entre 0 et 100)
    if (rating !== undefined && (isNaN(rating) || rating < 0 || rating > 100)) {
      return res.status(400).json({ error: 'Invalid rating. Rating must be a number between 0 and 100' });
    } else if (rating = "null") {
      rating = undefined
    }




    // Si skillCategory est une chaîne, la transformer en tableau
    if (typeof skillCategory === 'string') {
      // Séparer la chaîne en tableau en utilisant la virgule comme délimiteur
      skillCategory = skillCategory.split(',');
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



    if (file != undefined) {
      // Vérifier le type de fichier (extension)
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return res.status(400).json({ message: "Le fichier doit être de type JPG ou PNG." });
      }

      // Générer une suite de nombres aléatoires
      const randomNumbers = Math.random().toString(36).substring(2, 8);
      // Récupérer l'extension du fichier
      const fileExtension = file.originalname.replace(/\s+/g, '_');
      // Concaténer la suite de nombres avec le nom d'origine du fichier
      file.originalname = `${randomNumbers}-${fileExtension}`;



      // Enregistrez le fichier dans votre système de fichiers (dans le dossier 'uploads')
      const uploadPath = __dirname + '/../uploads/' + file.originalname; // Chemin du fichier dans votre système de fichiers
      fs.writeFile(uploadPath, file.buffer, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'An error occurred while saving the file.' });
        }
      })

    }

    let logo
    if (!file) {
      logo = undefined;
    } else {
      logo = "/uploads/" + req.file.originalname;
    }

    // Créer une nouvelle instance de Skill avec les données
    const newSkill = new Skill({
      name: name.trim(),
      // logo: logo,
      rating: rating,
      skillCategory: skillCategory !== undefined ? (Array.isArray(skillCategory) ? skillCategory.filter(id => id.trim() !== '') : [skillCategory.trim()]) : null,
      file: logo
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


//! PATCH /skill/:id
//! Modifie une skill par son ID
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
    if (req.body.name !== undefined && req.body.name.trim() !== '') {
      updatedFields.name = req.body.name.trim();
    } else {
      return res.status(400).json({ error: 'name ne peux pas être vide' });
    }





    // Vérifier si le rating est valide (compris entre 0 et 100)
    if (updatedFields.rating !== undefined && (isNaN(updatedFields.rating) || updatedFields.rating < 0 || updatedFields.rating > 100)) {
      return res.status(400).json({ error: 'Invalid rating. Rating must be a number between 0 and 100' });
    } else if (updatedFields.rating == undefined) {
      updatedFields.$unset = { rating: "" };
    }



    let skillCategory = req.body.skillCategory;



    // Si skillCategory est une chaîne, la transformer en tableau
    if (typeof skillCategory === 'string') {
      // Séparer la chaîne en tableau en utilisant la virgule comme délimiteur
      skillCategory = skillCategory.split(',');
    }

    if (skillCategory.length === 0) {
      skillCategory = undefined;
    }



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
        const trimmedId = categoryId;
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
      updatedFields.categories = null;

    }



    ImageToDelete = req.body.ImageToDelete
    file = req.file

    if (ImageToDelete !== "undefined") {
      // Supprimer le fichier associé à la compétence
        // Récupérer le chemin complet du fichier
        const filePath = path.join('./src', ImageToDelete);

        // Vérifier si le fichier existe
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (!err) {
            // Le fichier existe, le supprimer
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ error: 'An error occurred while deleting the file' });
              }
            });
          } else {
            console.error('Error accessing file:', err);
          }
        });
      
    }

    if (file != undefined) {
      // Vérifier le type de fichier (extension)
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return res.status(400).json({ message: "Le fichier doit être de type JPG ou PNG." });
      }

      // Générer une suite de nombres aléatoires
      const randomNumbers = Math.random().toString(36).substring(2, 8);
      // Récupérer l'extension du fichier
      const fileExtension = file.originalname.replace(/\s+/g, '_');
      // Concaténer la suite de nombres avec le nom d'origine du fichier
      file.originalname = `${randomNumbers}-${fileExtension}`;



      // Enregistrez le fichier dans votre système de fichiers (dans le dossier 'uploads')
      const uploadPath = __dirname + '/../uploads/' + file.originalname; // Chemin du fichier dans votre système de fichiers
      fs.writeFile(uploadPath, file.buffer, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'An error occurred while saving the file.' });
        }
      })

    }

    if (!file) {
      updatedFields.file = undefined;
    } else {
      updatedFields.file = "/uploads/" + req.file.originalname;
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


//! DELETE /skill/:id
//! Supprime une skill par son ID
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
    // Rechercher la skill à supprimer dans la base de données par son ID et la supprimer
    const skill = await Skill.findById(req.params.id);

    // Vérifier si la skill existe
    if (!skill) {
      // Si la skill n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'Skill not found' });
    }


    // Supprimer le fichier associé à la compétence
    if (skill.file) {
      // Récupérer le chemin complet du fichier
      const filePath = path.join('./src', skill.file);

      // Vérifier si le fichier existe
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          // Le fichier existe, le supprimer
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'An error occurred while deleting the file' });
            }
          });
        } else {
          console.error('Error accessing file:', err);
        }
      });
    }
    // Recherche de toutes les compétences qui ont cette catégorie de compétences
    const certificationsToUpdate = await Certification.find({ skills: req.params.id });

    // Parcourez chaque compétence et supprimez l'ID de la catégorie de compétences à supprimer
    for (const certification of certificationsToUpdate) {
      certification.skills = certification.skills.filter(id => id !== req.params.id); // Supprimer l'ID de la catégorie de compétences
      if (certification.skills.length === 0) {
        certification.skills = null; // Mettre à null si le tableau devient vide
      }
      await certification.save(); // Enregistrer la compétence mise à jour
    }



    // Recherche de toutes les compétences qui ont cette catégorie de compétences
    const educationToUpdate = await Education.find({ skills: req.params.id });

    // Parcourez chaque compétence et supprimez l'ID de la catégorie de compétences à supprimer
    for (const education of educationToUpdate) {
      education.skills = education.skills.filter(id => id !== req.params.id); // Supprimer l'ID de la catégorie de compétences
      if (education.skills.length === 0) {
        education.skills = null; // Mettre à null si le tableau devient vide
      }
      await education.save(); // Enregistrer la compétence mise à jour
    }


    // Recherche de toutes les compétences qui ont cette catégorie de compétences
    const experienceToUpdate = await Experience.find({ skills: req.params.id });

    // Parcourez chaque compétence et supprimez l'ID de la catégorie de compétences à supprimer
    for (const experience of experienceToUpdate) {
      experience.skills = experience.skills.filter(id => id !== req.params.id); // Supprimer l'ID de la catégorie de compétences
      if (experience.skills.length === 0) {
        experience.skills = null; // Mettre à null si le tableau devient vide
      }
      await experience.save(); // Enregistrer la compétence mise à jour
    }


    // Recherche de toutes les compétences qui ont cette catégorie de compétences
    const projectToUpdate = await Project.find({ skills: req.params.id });

    // Parcourez chaque compétence et supprimez l'ID de la catégorie de compétences à supprimer
    for (const project of projectToUpdate) {
      project.skills = project.skills.filter(id => id !== req.params.id); // Supprimer l'ID de la catégorie de compétences
      if (project.skills.length === 0) {
        project.skills = null; // Mettre à null si le tableau devient vide
      }
      await project.save(); // Enregistrer la compétence mise à jour
    }


    await Skill.findByIdAndDelete(req.params.id);

    // Si la skill est trouvée et supprimée avec succès, renvoyer une réponse avec le code 200
    res.status(200).send(`${skill.name} deleted`);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

//! GET /skills
//! Récupère toutes les skills
exports.getAllSkills = async (req, res) => {
  try {
    // Trouver toutes les skills dans la base de données
    const skills = await Skill.find();

    if (!skills) {
      return res.status(404).json({ error: 'Aucune skills pour le moment' });
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


// GET /skill/:id/certifications
// Récupère toutes les educations depuis une skill
exports.getAllCertificationsFromSkill = async (req, res) => {
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
    const certifications = await Certification.find({ skills: skillId });

    // Vérifier si des projets ont été trouvés
    if (certifications.length === 0) {
      return res.status(404).json({ error: 'No certifications found for the specified skill' });
    }

    // Répondre avec les projets trouvées
    res.status(200).json(certifications);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};
