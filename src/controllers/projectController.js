const Skills = require('../models/skillModel');
const Project = require('../models/projectModel');

// POST /project
// Crée une Project
exports.createProject = async (req, res) => {
  try {
    // Extraire les données de la requête POST en supprimant les espaces avant et après (trim)
    let { name, shortDescription, details, skills, links, images } = req.body;

    // Vérifier si les champs obligatoires sont présents dans la requête
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: name' });
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

    if (images !== undefined && Array.isArray(images)) {
      const validImages = [];

      // Parcours de chaque élément du tableau images
      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        // Vérification de la présence et de la validité du nom et de l'URL
        if ((image.title === undefined || image.title.trim() === '') &&
          (image.alt === undefined || image.alt.trim() === '') &&
          (image.description === undefined || image.description.trim() === '') &&
          (image.url === undefined || image.url.trim() === '')) {
          // Si tous les champs sont vides, ignorer cette entrée
          continue;
        }

        if ((image.title === undefined || image.title.trim() === '') && (image.url === undefined || image.url.trim() === '')) {
          // Si le titre et l'URL de l'image sont manquants ou invalide, renvoyer une erreur
          return res.status(400).json({ error: `(${i + 1}) Missing title and URL` });
        }

        if (image.title === undefined || image.title.trim() === '') {
          // Si le titre de l'image est manquant ou invalide, renvoyer une erreur
          return res.status(400).json({ error: `(${i + 1}) Missing title for image : ${image.url.trim()}` });
        }
        if (image.url === undefined || image.url.trim() === '') {
          // Si l'URL de l'image est manquante ou invalide, renvoyer une erreur
          return res.status(400).json({ error: `(${i + 1}) Missing URL for image : ${image.title.trim()}` });
        }

        // Vérifier si le logo est fourni et s'il a une extension .jpg ou .png
        const logoRegex = /[^.\s][a-zA-Z0-9\s-]*\.(jpg|png)$/i;
        // Remplacer les espaces par des underscores dans le logo
        const trimmedURL = image.url.trim().replace(/ /g, '_');
        // Vérifier si le logo a une extension valide
        if (!logoRegex.test(trimmedURL)) {
          return res.status(400).json({ error: `(${i + 1}) The url of : ${image.title.trim()}, needs to have a .jpg or .png extension` });
        }



        // Trim et vérification si non vide pour `title`, `alt`, `description` et `url`
        const trimmedTitle = image.title.trim();
        const trimmedAlt = image.alt !== undefined ? (image.alt.trim() !== "" ? image.alt.trim() : undefined) : image.alt;
        const trimmedDescription = image.description !== undefined ? (image.description.trim() !== "" ? image.description.trim() : undefined) : image.description;

        // Ajouter l'image valide à la liste des images à insérer dans la base de données
        validImages.push({
          title: trimmedTitle,
          alt: trimmedAlt,
          description: trimmedDescription,
          url: trimmedURL
        });
      }

      // Remplacer la liste d'images par les images valides si elles existent
      images = validImages.length > 0 ? validImages : null;
    } else {
      // Si `images` n'est pas un tableau ou n'est pas défini, renvoyer une erreur
      images = null;
    }

    // Créer une nouvelle instance de Project avec les données
    const newProject = new Project({
      name: name.trim(),
      shortDescription: shortDescription !== undefined ? (shortDescription.trim() !== "" ? shortDescription.trim() : undefined) : shortDescription,
      details: details !== undefined ? (details.trim() !== "" ? details.trim() : undefined) : details,
      skills: skills !== undefined ? (Array.isArray(skills) ? skills.filter(id => id.trim() !== '')/* trim() ne mache pas */ : [skills.trim()]) : null,
      links,
      images
    });

    // Enregistrer la nouvelle Project dans la base de données
    const skill = await newProject.save();

    // Répondre avec la nouvelle Project créée
    res.status(201).json(skill);
  } catch (err) {
    // Gérer les erreurs
    console.error(err);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};



// GET /projects
// Récupère toutes les projets
exports.getAllProjects = async (req, res) => {
  try {
    // Trouver toutes les projets dans la base de données
    const projects = await Project.find();

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


// DELETE /project/:id
// Supprime une project par son ID
exports.deleteProject = async (req, res) => {
  try {
    // Rechercher la project à supprimer dans la base de données par son ID et la supprimer
    const project = await Project.findByIdAndDelete(req.params.id);

    // Vérifier si la project existe
    if (!project) {
      // Si la project n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'Project not found' });
    }

    // Si la project est trouvée et supprimée avec succès, renvoyer une réponse avec le code 200
    res.status(200).send('Project deleted');
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};


//Perfectionner
// PATCH /project/:id
// Modifie un projet par son ID
exports.updateProject = async (req, res) => {
  try {
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
    }

// Vérifier si le champ 'shortDescription' est fourni et est de type chaîne de caractères non vide
if (req.body.shortDescription !== undefined && req.body.shortDescription.trim() !== '') {
  if (req.body.shortDescription.trim() == "delete") {
    // Utiliser l'opérateur $unset de Mongoose pour supprimer le champ shortDescription
    updatedFields.$unset = { shortDescription: "" };
  } else {
    updatedFields.shortDescription = req.body.shortDescription.trim();
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


    
    if (req.body.links !== undefined) {
      // Vérification de la présence et du type de `links`
      if (req.body.links !== undefined && Array.isArray(req.body.links)) {
        const validLinks = [];

        // Parcours de chaque élément du tableau links
        for (let i = 0; i < req.body.links.length; i++) {
          const link = req.body.links[i];

          // Vérification de la présence et de la validité du nom et de l'URL
          if ((link.name === undefined || link.name.trim() === '') &&
            (link.url === undefined || link.url.trim() === '')) {
            // Si le nom et l'URL du lien sont tous les deux manquants ou invalides, ignorer cette entrée
            continue;
          }

          if (link.name === undefined || link.name.trim() === '') {
            // Si le nom du lien est manquant ou invalide, renvoyer une erreur
            return res.status(400).json({ error: `(${i + 1}) Missing name for link: ${link.url.trim()}` });
          }

          if (link.url === undefined || link.url.trim() === '') {
            // Si l'URL du lien est manquante ou invalide, renvoyer une erreur
            return res.status(400).json({ error: `(${i + 1}) Missing URL for link: ${link.name.trim()}` });
          }

          // Trim et vérification si non vide pour `name` et `url`
          const trimmedName = link.name.trim();
          const trimmedUrl = link.url.trim();

          // Vérification de la structure de l'URL
          if (!isValidURI(trimmedUrl)) {
            // Si l'URL n'a pas la bonne structure, renvoyer une erreur
            return res.status(400).json({ error: `(${i + 1}) Invalid URL structure for link: ${trimmedName}` });
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

    if (req.body.images !== undefined) {
      // Vérification de la présence et du type de `images`
      if (req.body.images !== undefined && Array.isArray(req.body.images)) {
        const validImages = [];

        // Parcours de chaque élément du tableau images
        for (let i = 0; i < req.body.images.length; i++) {
          const image = req.body.images[i];

          // Vérification de la présence et de la validité du titre et de l'URL
          if ((image.title === undefined || image.title.trim() === '') &&
            (image.url === undefined || image.url.trim() === '')) {
            // Si le titre et l'URL de l'image sont tous les deux manquants ou invalides, ignorer cette entrée
            continue;
          }

          if (image.title === undefined || image.title.trim() === '') {
            // Si le titre de l'image est manquant ou invalide, renvoyer une erreur
            return res.status(400).json({ error: `(${i + 1}) Missing title for image: ${image.url.trim()}` });
          }

          if (image.url === undefined || image.url.trim() === '') {
            // Si l'URL de l'image est manquante ou invalide, renvoyer une erreur
            return res.status(400).json({ error: `(${i + 1}) Missing URL for image: ${image.title.trim()}` });
          }

          // Vérifier si l'image a une extension .jpg ou .png
          const imageRegex = /[^.\s][a-zA-Z0-9\s-]*\.(jpg|png)$/i;
          // Trim et vérification si non vide pour `title`, `alt`, `description` et `url`
          const trimmedTitle = image.title.trim();
          const trimmedAlt = image.alt !== undefined ? (image.alt.trim() !== "" ? image.alt.trim() : undefined) : image.alt;
          const trimmedDescription = image.description !== undefined ? (image.description.trim() !== "" ? image.description.trim() : undefined) : image.description;
          const trimmedURL = image.url.trim();

          // Vérifier si l'URL de l'image a une extension valide
          if (!imageRegex.test(trimmedURL)) {
            return res.status(400).json({ error: `(${i + 1}) The URL of: ${trimmedTitle}, needs to have a .jpg or .png extension` });
          }

          // Ajouter l'image valide à la liste des images à insérer dans la base de données
          validImages.push({
            title: trimmedTitle,
            alt: trimmedAlt,
            description: trimmedDescription,
            url: trimmedURL
          });
        }

        // Si des images valides sont trouvées, les ajouter à la liste des images à insérer dans la base de données
        updatedFields.images = validImages.length > 0 ? validImages : null;
      } else {
        // Si `images` n'est pas un tableau ou n'est pas défini, renvoyer une erreur
        updatedFields.images = null;
      }
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
