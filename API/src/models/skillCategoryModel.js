const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { updateCreatedAt, updateUpdatedAt } = require('../middleware/timestamps.js');

const skillCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
});

// Ajouter un middleware "pre" pour mettre à jour la date et l'heure de création avant chaque enregistrement
skillCategorySchema.pre('save', updateCreatedAt);

// Ajouter un middleware "pre" pour mettre à jour la date et l'heure de modification avant chaque mise à jour
skillCategorySchema.pre('findOneAndUpdate', updateUpdatedAt);

module.exports = mongoose.model('SkillCategory', skillCategorySchema);
