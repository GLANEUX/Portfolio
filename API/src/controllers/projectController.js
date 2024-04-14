const Skills = require('../models/skillModel');
const Project = require('../models/projectModel');
const fs = require('fs');
const path = require('path');


//! POST /project
//! Crée une Project
exports.createProject = async (req, res) => {
  try {

    // Extraire les données de la requête POST en supprimant les espaces avant et après (trim)
    let { name, shortDescription, details, skills, links, images } = req.body;

    // Vérifier si les champs obligatoires sont présents dans la requête
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: name' });
    }

    // Vérification de la présence et du type de `links`
    if (links !== undefined && Array.isArray(links)) {
      const validLinks = [];

      // Parcours de chaque élément du tableau links
      for (let i = 0; i < links.length; i++) {
        const link = links[i];

        // Vérification de la présence et de la validité du nom et de l'URL
        if ((link.name === undefined || link.name.trim() === '') &&
          (link.url === undefined || link.url.trim() === '')) {
          // Si le nom et l'URL du lien sont tous les deux manquants ou invalides, ignorer cette entrée
          continue;
        }

        if (link.name === undefined || link.name.trim() === '') {
          // Si le nom du lien est manquant ou invalide, renvoyer une erreur
          return res.status(400).json({ error: `(${i + 1}) Missing name for link : ${link.url.trim()}` });
        }


        if (link.url === undefined || link.url.trim() === '') {
          // Si l'URL du lien est manquante ou invalide, renvoyer une erreur
          return res.status(400).json({ error: `(${i + 1}) Missing URL for link : ${link.name.trim()}` });
        }

        // Trim et vérification si non vide pour `name` et `url`
        const trimmedName = link.name.trim();
        const trimmedUrl = link.url.trim();

        // Vérification de la structure de l'URL
        if (!isValidURI(trimmedUrl)) {
          // Si l'URL n'a pas la bonne structure, renvoyer une erreur
          return res.status(400).json({ error: `(${i + 1}) Invalid URL structure for link  : ${trimmedName}` });
        }

        // Ajouter le lien valide à la liste des liens à insérer dans la base de données
        validLinks.push({
          name: trimmedName,
          url: trimmedUrl
        });
      }

      // Si des liens valides sont trouvés, les ajouter à la liste des links à insérer dans la base de données
      links = validLinks.length > 0 ? validLinks : null;
    } else {
      // Si `links` n'est pas un tableau ou n'est pas défini, renvoyer une erreur
      links = null;
    }
    // Fonction pour vérifier si une URL est valide
    function isValidURI(uri) {
      try {
        new URL(uri);
        return true;
      } catch (error) {
        return false;
      }
    }
    // Si skills est une chaîne, la transformer en tableau
    if (typeof skills === 'string') {
      // Séparer la chaîne en tableau en utilisant la virgule comme délimiteur
      skills = skills.split(',');
    }

    // Vérifier si Projects est fourni 
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



    if(images){// Pour chaque image, traiter le fichier et obtenir le chemin d'accès
    const processedImages = req.files.map((file, index) => {
      if (file) {
        // Vérifiez le type de fichier (extension)
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          throw new Error(`Le fichier ${file.originalname} doit être de type JPG ou PNG.`);
        }

        // Générez une suite de nombres aléatoires
        const randomNumbers = Math.random().toString(36).substring(2, 8);
        // Obtenez l'extension du fichier
        const fileExtension = file.originalname.replace(/\s+/g, '_');
        // Concaténez la suite de nombres avec le nom d'origine du fichier
        file.originalname = `${randomNumbers}-${fileExtension}`;

        // Enregistrez le fichier dans votre système de fichiers (dans le dossier 'uploads')
        const uploadPath = __dirname + '/../uploads/' + file.originalname; // Chemin du fichier dans votre système de fichiers
        // Écrivez le fichier sur le disque
        fs.writeFileSync(uploadPath, file.buffer);

        // Retournez le chemin d'accès au fichier téléchargé
        return `/uploads/${file.originalname}`;
      } else {
        // Si le fichier n'existe pas, retournez undefined
        return undefined;
      }
    });

    // Mettre à jour chaque objet image avec le chemin d'accès correspondant
    processedImages.forEach((imagePath, index) => {
      // Vérifier si l'image existe dans le tableau images
      if (images[index]) {
        // Mettre à jour le champ url de l'image avec le chemin d'accès
        images[index].url = imagePath;
      }
    });}




    // Créer une nouvelle instance de Project avec les données
    const newProject = new Project({
      name: name.trim(),
      shortDescription: shortDescription !== undefined ? (shortDescription.trim() !== "" ? shortDescription.trim() : undefined) : shortDescription,
      details: details !== undefined ? (details.trim() !== "" ? details.trim() : undefined) : details,
      skills: skills !== undefined ? (Array.isArray(skills) ? skills.filter(id => id.trim() !== '')/* trim() ne mache pas */ : [skills.trim()]) : null,
      links: links,
      images: images = undefined ? images = null : images
    });

    // Enregistrer la nouvelle Project dans la base de données
    const project = await newProject.save();

    // Répondre avec la nouvelle Project créée
    res.status(201).json(project);
  } catch (err) {
    // Gérer les erreurs
    console.error(err);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};


//! GET /projects
//! Récupère toutes les projets
exports.getAllProjects = async (req, res) => {
  try {
    // Trouver toutes les projets dans la base de données
    const projects = await Project.find();
    if (!projects) {
      return res.status(404).json({ error: 'Aucune projects pour le moment' });
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

// GET /project/:id
// Récupère une project par son ID
exports.getProjectById = async (req, res) => {
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
    // Rechercher la project dans la base de données par son ID
    const project = await Project.findById(req.params.id);


    // Vérifier si la project existe
    if (!project) {
      // Si la project n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Si la project est trouvée, renvoyer une réponse avec la project
    res.status(200).json(project);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};


//! DELETE /project/:id
//! Supprime une project par son ID
exports.deleteProject = async (req, res) => {
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



    const project = await Project.findById(req.params.id);

    // Vérifier si la project existe
    if (!project) {
      // Si la project n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'Project not found' });
    }



    project.images.forEach(image => {

      // Supprimer le fichier associé à la compétence
      if (image.url) {
        // Récupérer le chemin complet du fichier
        const filePath = path.join('./src', image.url);

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
    });

    // Rechercher la project à supprimer dans la base de données par son ID et la supprimer
    await Project.findByIdAndDelete(req.params.id);

    // Si la project est trouvée et supprimée avec succès, renvoyer une réponse avec le code 200
    res.status(200).send(`${project.name} deleted`);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};


//! PATCH /project/:id
//! Modifie un projet par son ID
exports.updateProject = async (req, res) => {
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
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Initialiser un objet pour stocker les champs mis à jour
    let updatedFields = {};

    // Vérifier si le champ 'name' est fourni et est de type chaîne de caractères non vide
    if (req.body.name !== undefined && req.body.name.trim() !== '') {
      updatedFields.name = req.body.name.trim();
    } else {
      return res.status(400).json({ error: 'Name ne peux pas être vide' });
    }



    updatedFields.shortDescription = req.body.shortDescription ? req.body.shortDescription.trim() : req.body.shortDescription
    updatedFields.details = req.body.details ? req.body.details.trim() : req.body.details


    let links = req.body.links
    
   if(links != undefined)
   { if (links.length === 0 || links == null) {
      links = undefined
    }}


    // Vérification de la présence et du type de `links`
    if (links !== undefined && Array.isArray(links)) {

      const validLinks = [];

      // Parcours de chaque élément du tableau links
      for (let i = 0; i < links.length; i++) {

        const link = links[i];
        // Vérification de la présence et de la validité du nom et de l'URL
        if ((link.name === undefined || link.name.trim() === '') &&
          (link.url === undefined || link.url.trim() === '')) {
          // Si le nom et l'URL du lien sont tous les deux manquants ou invalides, ignorer cette entrée
          continue;
        }

        if (link.name === undefined || link.name.trim() === '') {
          // Si le nom du lien est manquant ou invalide, renvoyer une erreur
          return res.status(400).json({ error: `(${i + 1}) Missing name for link : ${link.url.trim()}` });
        }


        if (link.url === undefined || link.url.trim() === '') {
          // Si l'URL du lien est manquante ou invalide, renvoyer une erreur
          return res.status(400).json({ error: `(${i + 1}) Missing URL for link : ${link.name.trim()}` });
        }

        // Trim et vérification si non vide pour `name` et `url`
        const trimmedName = link.name.trim();
        const trimmedUrl = link.url.trim();

        // Vérification de la structure de l'URL
        if (!isValidURI(trimmedUrl)) {
          // Si l'URL n'a pas la bonne structure, renvoyer une erreur
          return res.status(400).json({ error: `(${i + 1}) Invalid URL structure for link  : ${trimmedName}` });
        }

        // Ajouter le lien valide à la liste des liens à insérer dans la base de données
        validLinks.push({
          name: trimmedName,
          url: trimmedUrl
        });
      }

      // Si des liens valides sont trouvés, les ajouter à la liste des links à insérer dans la base de données
      updatedFields.links = validLinks.length > 0 ? validLinks : null;
    } else {
      // Si `links` n'est pas un tableau ou n'est pas défini, renvoyer une erreur
      updatedFields.links = null;
    }
    // Fonction pour vérifier si une URL est valide
    function isValidURI(uri) {
      try {
        new URL(uri);
        return true;
      } catch (error) {
        return false;
      }
    }



    let skills = req.body.skills;
    // Si skills est une chaîne, la transformer en tableau
    if (typeof skills === 'string') {
      // Séparer la chaîne en tableau en utilisant la virgule comme délimiteur
      skills = skills.split(',');
    }

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


    ImageToDelete = req.body.ImageToDelete
    images = req.body.images
    file = req.file

 
    if (typeof ImageToDelete === 'string') {
      // Séparer la chaîne en tableau en utilisant la virgule comme délimiteur
      ImageToDelete = ImageToDelete.split(',');
    }

if (Array.isArray(ImageToDelete)) {    
  if (ImageToDelete.length !== 0) {
    // Supprimer chaque fichier associé à la compétence
    ImageToDelete.forEach(fileName => {
      // Vérifier si le nom de fichier est une chaîne vide
      if (fileName.trim() !== '') { 
        // Construire le chemin complet du fichier
        const fullPath = path.join('./src', fileName);
      
        // Vérifier si le fichier existe
        fs.access(fullPath, fs.constants.F_OK, (err) => {
          if (!err) {
            // Le fichier existe, le supprimer
            fs.unlink(fullPath, (err) => {
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
    });
  }
}

    
    
      // Mettre à jour les URL des images avec les valeurs du tableau imageURLs
      if(images){
        // Pour chaque image, traiter le fichier et obtenir le chemin d'accès
const processedImages = req.files.map((file, index) => {
  if (file) {
    // Vérifiez le type de fichier (extension)
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      throw new Error(`Le fichier ${file.originalname} doit être de type JPG ou PNG.`);
    }

    // Générez une suite de nombres aléatoires
    const randomNumbers = Math.random().toString(36).substring(2, 8);
    // Obtenez l'extension du fichier
    const fileExtension = file.originalname.replace(/\s+/g, '_');
    // Concaténez la suite de nombres avec le nom d'origine du fichier
    const fileName = `${randomNumbers}-${fileExtension}`; 

    // Enregistrez le fichier dans votre système de fichiers (dans le dossier 'uploads')
    const uploadPath = __dirname + '/../uploads/' + fileName; // Chemin du fichier dans votre système de fichiers
    // Écrivez le fichier sur le disque
    fs.writeFileSync(uploadPath, file.buffer);

    // Retournez le chemin d'accès au fichier téléchargé
    return `/uploads/${fileName}`;
  } else {
    // Si le fichier n'existe pas, retournez undefined
    return undefined;
  }
});
    // Créer un tableau pour stocker les URL d'images
    let imageURLs = [];
      // Parcourir les images pour extraire les URL valides
      images.forEach((image) => {
        // Vérifier si l'URL de l'image est valide et différente de "undefined"
        if (image.url && image.url !== 'undefined') {
          imageURLs.push(image.url); // Ajouter l'URL existante au tableau
        }
      });
    
    
    // Parcourir les nouveaux chemins d'accès et les ajouter à imageURLs
    processedImages.forEach((imagePath) => {
      if (imagePath) {
        imageURLs.push(imagePath); // Ajouter le nouveau chemin d'accès au tableau
      }
    });
    
  
      images.forEach((image, index) => {
        if (index < imageURLs.length) {
          image.url = imageURLs[index]; // Remplacer l'URL de l'image
        }
      });
    }
    
    // Mettre à jour le champ images dans les champs mis à jour
    if(images === undefined){
      updatedFields.images = null;
    } else {
      updatedFields.images = images;
    }
    




    // Mettre à jour le projet avec les champs mis à jour
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    // Répondre avec le projet mis à jour
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};
