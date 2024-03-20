const Certification = require('../models/certificationModel');
// POST /certification
// Crée une certification
exports.createCertification = async (req, res) => {
  try {

    // Extraire les données de la requête POST en supprimant les espaces avant et après (trim)
    const name = req.body.name.trim();
    const details = req.body.details ? req.body.details.trim() : undefined;

    // Vérifier si les champs obligatoires sont présents dans la requête
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: 'Missing required parameters: name' });
    }


    // Créer une nouvelle instance de Certification avec les données
    const newCertification = new Certification({
      name: name.trim(),
      details: details ? details.trim() : undefined
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

// GET /certifications
// Récupère toutes les certifications
exports.getAllCertifications = async (req, res) => {
  try {
    // Trouver toutes les certifications dans la base de données
    const certifications = await Certification.find();

    // Répondre avec les certifications trouvées
    res.status(200).json(certifications);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};

// PATCH /certification/:id
// Modifie une certification par son ID
exports.updateCertification = async (req, res) => {
  try {
    // Rechercher la certification à mettre à jour
    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    // Initialiser un objet pour stocker les champs mis à jour
    let updatedFields = {};

    // Vérifier si le champ 'name' est fourni et n'est pas vide
    if (req.body.name !== undefined && req.body.name.trim() !== '') {
      updatedFields.name = req.body.name;
    }

    // Vérifier si le champ 'details' est fourni et n'est pas vide
    if (req.body.details !== undefined && req.body.details.trim() !== '') {
      updatedFields.details = req.body.details;
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

// GET /certification/:id
// Récupère une certification par son ID
exports.getCertificationById = async (req, res) => {
  try {
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

// DELETE /certification/:id
// Supprime une certification par son ID
exports.deleteCertification = async (req, res) => {
  try {
    // Rechercher la certification à supprimer dans la base de données par son ID et la supprimer
    const certification = await Certification.findByIdAndDelete(req.params.id);

    // Vérifier si la certification existe
    if (!certification) {
      // Si la certification n'est pas trouvée, renvoyer une réponse avec le code 404
      return res.status(404).json({ error: 'Certification not found' });
    }

    // Si la certification est trouvée et supprimée avec succès, renvoyer une réponse avec le code 200
    res.status(200).send('Certification deleted');
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    // En cas d'erreur, renvoyer une réponse d'erreur avec le code 500
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
};
