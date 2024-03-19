const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { updateCreatedAt, updateUpdatedAt } = require('../middleware/timestamps.js');

// Définition du schéma du projet
const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String
    },
    // details: {
    //     type: String
    // },
    // links: [
    //     {
    //         name: {
    //             type: String
    //         },
    //         url: {
    //             type: String,
    //             format: 'uri'
    //         }
    //     }
    // ],
    // images: [
    //     {
    //         title: {
    //             type: String
    //         },
    //         alt: {
    //             type: String
    //         },
    //         description: {
    //             type: String
    //         },
    //         url: {
    //             type: String
    //         }
    //     }
    // ],
    // skills: {
    //     type: [String]
    // },
    created_at: {
        type: String,
    },
    updated_at: {
        type: String,
    }
});

// Ajouter un middleware "pre" pour mettre à jour la date et l'heure de création avant chaque enregistrement
projectSchema.pre('save', updateCreatedAt);

// Ajouter un middleware "pre" pour mettre à jour la date et l'heure de modification avant chaque mise à jour
projectSchema.pre('findOneAndUpdate', updateUpdatedAt);

module.exports = mongoose.model('Project', projectSchema);
