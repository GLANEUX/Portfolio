const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { updateCreatedAt, updateUpdatedAt } = require('../middleware/timestamps.js');

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    logo: {
        type: String
    },
    rating: {
        type: Number,
        min: 0,
        max: 100
    },
    skillCategory: {
        type: [String]
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
});

// Ajouter un middleware "pre" pour mettre à jour la date et l'heure de création avant chaque enregistrement
skillSchema.pre('save', updateCreatedAt);

// Ajouter un middleware "pre" pour mettre à jour la date et l'heure de modification avant chaque mise à jour
skillSchema.pre('findOneAndUpdate', updateUpdatedAt);

module.exports = mongoose.model('Skill', skillSchema);
