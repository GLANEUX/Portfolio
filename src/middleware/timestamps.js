const moment = require('moment-timezone');

// Définir le fuseau horaire souhaité
const timeZone = 'Europe/Paris';

// Obtenez la date et l'heure actuelles dans le fuseau horaire spécifié
const getCurrentTime = () => moment().tz(timeZone).format();

// Middleware pour mettre à jour la date et l'heure de création avant chaque enregistrement
const updateCreatedAt = function(next) {
    if (!this.created_at) {
        this.created_at = getCurrentTime();
    }
    if (!this.updated_at) {
        this.updated_at = getCurrentTime();
    }
    next();
};

// Middleware pour mettre à jour la date et l'heure de modification avant chaque mise à jour
const updateUpdatedAt = function(next) {
    this._update.updated_at = getCurrentTime();
    next();
};

module.exports = { updateCreatedAt, updateUpdatedAt };
