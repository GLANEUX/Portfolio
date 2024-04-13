const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { updateCreatedAt, updateUpdatedAt } = require('../middleware/timestamps.js');

// Définir le schéma de certification
const certificationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true // Supprimer les espaces avant et après
    },
    details: {
        type: String,
        trim: true
    },
    created_at: {
        type: String,
        require: true
    },
    updated_at: {
        type: String,
        require: true
    }
});

// Ajout d'une date et de skill

// Ajouter un middleware "pre" pour mettre à jour la date et l'heure de création avant chaque enregistrement
certificationSchema.pre('save', updateCreatedAt);

// Ajouter un middleware "pre" pour mettre à jour la date et l'heure de modification avant chaque mise à jour
certificationSchema.pre('findOneAndUpdate', updateUpdatedAt);

module.exports = mongoose.model('Certification', certificationSchema);
