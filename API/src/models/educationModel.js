const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { updateCreatedAt, updateUpdatedAt } = require('../middleware/timestamps.js');

const educationSchema = new mongoose.Schema({
    // start_date: {
    //     type: String
    // },
    // end_date: {
    //     type: String
    // },
    school: {
        type: String,
        require: true
    },
    program: {
        type: String
    },
    details: {
        type: String
    },
    skills: {
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
educationSchema.pre('save', updateCreatedAt);

// Ajouter un middleware "pre" pour mettre à jour la date et l'heure de modification avant chaque mise à jour
educationSchema.pre('findOneAndUpdate', updateUpdatedAt);



module.exports = mongoose.model('Education', educationSchema);
