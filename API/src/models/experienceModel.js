const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { updateCreatedAt, updateUpdatedAt } = require('../middleware/timestamps.js');

const experienceSchema = new mongoose.Schema({
    start_date: {
        type: String,
        require: true
    },
    end_date: {
        type: String,
        require: true
    },
    company: {
        type: String,
        require: true
    },
    job_title: {
        type: String,
        require: true
    },
    details: {
        type: String
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
experienceSchema.pre('save', updateCreatedAt);

// Ajouter un middleware "pre" pour mettre à jour la date et l'heure de modification avant chaque mise à jour
experienceSchema.pre('findOneAndUpdate', updateUpdatedAt);



module.exports = mongoose.model('Experience', experienceSchema);
