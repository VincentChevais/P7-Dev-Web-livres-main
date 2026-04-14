// Middleware de validation des données d'entrée
// Ce module contient des fonctions qui vérifient que les données reçues
// dans les requêtes HTTP sont valides avant de les transmettre aux controllers.

// Vérifie le format basique d'un email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mot de passe d'au moins 8 caractères 
const passwordRegex = /^.{8,}$/;

// Texte non vide, longueur maximale de 200 caractères
const textRegex = /^.{1,200}$/;

// Module pour gérer les erreurs de validation
const { throwError } = require('../utils/errorHandler');

/*
* Validation des données d'inscription
* Erreurs en code 400 : problème de forme, de validation
*/
exports.validateSignup = (req, res, next) => {
    let { email, password } = req.body;

    // Vérification que les champs existent et sont de type string
    if (typeof email !== 'string' || typeof password !== 'string') {
        throwError(req, 400, 'Données invalides');
    }

    // Nettoyage des espaces et lowercase
    const cleanEmail = email.trim().toLowerCase();

    // Validation de l'email
    if (!emailRegex.test(cleanEmail)) {
        throwError(req, 400, 'Email invalide');
    }

    // Validation du mot de passe (min 8 caractères)
    if (!passwordRegex.test(password)) {
        throwError(req, 400, 'Mot de passe invalide. Min 8 caractères.');
    }

    // On remet les valeurs propres dans req.body
    req.body.email = cleanEmail;
    req.body.password = password;

    next();
};

/*
* Validation des données de connexion
* Erreurs en code 400 : problème de forme, de validation
*/
exports.validateLogin = (req, res, next) => {
    let { email, password } = req.body;

    // Vérification des types
    if (typeof email !== 'string' || typeof password !== 'string') {
        throwError(req, 400, 'Données invalides');
    }

    // Nettoyage de l'email uniquement
    const cleanEmail = email.trim().toLowerCase();

    // Validation email
    if (!emailRegex.test(cleanEmail)) {
        throwError(req, 400, 'Email invalide');
    }

    // Vérification minimale du mot de passe
    if (password.length === 0 || password.length > 128) {
        throwError(req, 400, 'Mot de passe invalide');
    }

    // Réinjection dans req.body
    req.body.email = cleanEmail;
    req.body.password = password;

    next();
};


/*
* Validation des données d'un livre
* (utilisée pour POST et PUT)
*/
exports.validateBook = (req, res, next) => {
    let bookData;

    // Avec Multer, les données peuvent arriver sous forme de string JSON dans req.body.book
    if (req.body.book) {
        try {
            bookData = JSON.parse(req.body.book);
            // On remplace la string par l'objet parsé pour la suite de la chaîne
            req.body.book = bookData;
        } catch (e) {
            throwError(req, 400, 'Données du livre invalides');
        }
    } else {
        // Sinon, on utilise directement req.body (cas sans fichier)
        bookData = req.body;
    }

    let { title, author, year, genre } = bookData;

    // Nettoyage des champs texte et vérification de leur type
    if (typeof title !== 'string') {
        throwError(req, 400, 'Titre invalide');
    }
    if (typeof author !== 'string') {
        throwError(req, 400, 'Auteur invalide');
    }
    if (typeof genre !== 'string') {
        throwError(req, 400, 'Genre invalide');
    }

    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    const cleanGenre = genre.trim();

    // Validation du titre (non vide, max 200 caractères)
    if (!textRegex.test(cleanTitle)) {
        throwError(req, 400, 'Titre invalide');
    }

    // Validation de l'auteur (non vide, max 200 caractères)
    if (!textRegex.test(cleanAuthor)) {
        throwError(req, 400, 'Auteur invalide');
    }

    // Conversion et validation de l'année 
    const parsedYear = Number(year);

    if (!Number.isInteger(parsedYear) || parsedYear < 0 || parsedYear > new Date().getFullYear()) {
        throwError(req, 400, 'Année invalide');
    }

    // Validation du genre (non vide, max 200 caractères)
    if (!textRegex.test(cleanGenre)) {
        throwError(req, 400, 'Genre invalide');
    }

    // Remet les valeurs propres dans l'objet bookData pour les controllers
    bookData.title = cleanTitle;
    bookData.author = cleanAuthor;
    bookData.genre = cleanGenre;
    bookData.year = parsedYear;

    // Si tout est valide, on passe au controller
    next();
};


