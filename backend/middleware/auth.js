const jwt = require('jsonwebtoken');
const { throwError } = require('../utils/errorHandler');

module.exports = (req, res, next) => {
    try {
        // Vérifie que le header Authorization existe
        if (!req.headers.authorization) {
            throwError(req, 401, 'Requête non authentifiée');
        }

        // Récupération du token depuis le header Authorization (format: "Bearer TOKEN")
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            throwError(req, 401, 'Requête non authentifiée');
        }

        // Vérification du token (signature et expiration)
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Récupération de l'identifiant utilisateur depuis le token
        const userId = decodedToken.userId;

        // Ajout de l'userId à la requête pour les prochaines étapes
        req.auth = { userId };

        // Passage à la suite (route protégée)
        next();
    } catch (error) {
        /**
         * Si l'erreur vient de jwt.verify (token invalide / expiré) ou
         * d'un problème de header, on renvoie une erreur d'authentification.
         * Les autres erreurs techniques (ex: problème de connexion à MongoDB)
         * seront capturées par le middleware global de gestion des erreurs.
         */
        throwError(req, 401, 'Requête non authentifiée');
    }
};

