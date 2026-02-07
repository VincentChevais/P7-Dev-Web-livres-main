// Middleware de validation des données d'entrée
// Ce module contient des fonctions qui vérifient que les données reçues
// dans les requêtes HTTP sont valides avant de les transmettre aux controllers.

// Vérifie le format basique d'un email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mot de passe d'au moins 8 caractères (règle simple pour ce projet)
const passwordRegex = /^.{8,}$/;

// Texte non vide, longueur maximale de 200 caractères
const textRegex = /^.{1,200}$/;

// Module pour gérer les erreurs de validation
const { throwError } = require('../utils/errorHandler');

// =======================================
// Validation des données d'inscription
// =======================================
exports.validateSignup = (req, res, next) => {
    const { email, password } = req.body;

    // Vérifie que l'email est une string et respecte le format attendu
    if (typeof email !== 'string' || !emailRegex.test(email)) {
        throwError(req, 400, 'Email invalide');
    }

    // Vérifie que le mot de passe est une string et fait au moins 8 caractères
    if (typeof password !== 'string' || !passwordRegex.test(password)) {
        throwError(req, 400, 'Mot de passe invalide. Min 8 caractères.');
    }

    // Si tout est valide, on passe au controller
    next();
};

// =======================================
// Validation des données d'un livre
// (utilisée pour POST et PUT)
// =======================================
exports.validateBook = (req, res, next) => {
    let bookData;

    // Avec Multer, les données peuvent arriver sous forme de string JSON dans req.body.book
    if (req.body.book) {
        try {
            bookData = JSON.parse(req.body.book);
        } catch (e) {
            // Si le JSON est invalide, on supprime le fichier uploadé et on renvoie une erreur
            throwError(req, 400, 'Données du livre invalides');
        }
    } else {
        // Sinon, on utilise directement req.body (cas sans fichier)
        bookData = req.body;
    }

    const { title, author, year, genre } = bookData;

    // Validation du titre
    if (typeof title !== 'string' || !textRegex.test(title)) {
        throwError(req, 400, 'Titre invalide');
    }

    // Validation de l'auteur
    if (typeof author !== 'string' || !textRegex.test(author)) {
        throwError(req, 400, 'Auteur invalide');
    }

    // Validation de l'année
    if (typeof year !== 'number' || year < 0 || year > new Date().getFullYear()) {
        throwError(req, 400, 'Année invalide');
    }

    // Validation du genre
    if (typeof genre !== 'string' || !textRegex.test(genre)) {
        throwError(req, 400, 'Genre invalide');
    }

    // Si tout est valide, on passe au controller
    next();
};

