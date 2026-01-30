const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Récupération du token depuis le header Authorization. On enlève le préfixe "Bearer ".
        const token = req.headers.authorization.split(' ')[1];

        // Vérification du token (signature et expiration)
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Récupération de l'identifiant utilisateur
        const userId = decodedToken.userId;

        // Ajout de l'userId à la requête pour les prochaines étapes
        req.auth = { userId };

        // Passage à la suite
        next();
    } catch (error) {
        res.status(401).json({ error: 'Requête non authentifiée' }); // Erreur d'authentification
    }
};
