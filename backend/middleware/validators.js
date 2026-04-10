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
*/
exports.validateSignup = (req, res, next) => {
    let { email, password } = req.body;

    // Vérification que les champs existent et sont de type string
    if (typeof email !== 'string' || typeof password !== 'string') {
        throwError(req, 400, 'Données invalides');
    }

    // Nettoyage des espaces
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Validation de l'email
    if (!emailRegex.test(cleanEmail)) {
        throwError(req, 400, 'Email invalide');
    }

    // Validation du mot de passe (min 8 caractères)
    if (!passwordRegex.test(cleanPassword)) {
        throwError(req, 400, 'Mot de passe invalide. Min 8 caractères.');
    }

    // On remet les valeurs propres dans req.body
    req.body.email = cleanEmail;
    req.body.password = cleanPassword;

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

    // Validation du titre (au moins 1 caractère, pas de caractères interdits)
    if (cleanTitle.length === 0 || !textRegex.test(cleanTitle)) {
        throwError(req, 400, 'Titre invalide');
    }

    // Validation de l'auteur (au moins 1 caractère, pas de caractères interdits)
    if (cleanAuthor.length === 0 || !textRegex.test(cleanAuthor)) {
        throwError(req, 400, 'Auteur invalide');
    }

    // Conversion et validation de l'année 
    const parsedYear = Number(year);

    if (Number.isNaN(parsedYear) || parsedYear < 0 || parsedYear > new Date().getFullYear()) {
        throwError(req, 400, 'Année invalide');
    }

    // Validation du genre (genre non vide, max 200 caractères, pas de caractères interdits)
    if (cleanGenre.length === 0 || !textRegex.test(cleanGenre)) {
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


