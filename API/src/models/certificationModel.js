const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { updateCreatedAt, updateUpdatedAt } = require('../middleware/timestamps.js');

// Définir le schéma de certification
const certificationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    details: {
        type: String
    },
    date: {
        type: String,
        require: true
    },
    skills: {
        type: [String]
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


// Ajouter un middleware "pre" pour mettre à jour la date et l'heure de création avant chaque enregistrement
certificationSchema.pre('save', updateCreatedAt);

// Ajouter un middleware "pre" pour mettre à jour la date et l'heure de modification avant chaque mise à jour
certificationSchema.pre('findOneAndUpdate', updateUpdatedAt);

module.exports = mongoose.model('Certification', certificationSchema);
