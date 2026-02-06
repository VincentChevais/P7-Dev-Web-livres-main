/**
 * Controller des livres (books)
 *
 * Ce fichier contient la logique métier liée aux livres.
 * Il gère les opérations suivantes :
 * - récupérer tous les livres
 * - récupérer un livre par son id
 * - récupérer les 3 livres les mieux notés
 */

const Book = require('../models/Book');

/**
 * Récupérer tous les livres
 * GET /api/books
 */
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => {
            res.status(200).json(books);
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

/**
 * Récupérer un livre par son id
 * GET /api/books/:id
 */
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                return res.status(404).json({ error: 'Livre non trouvé' });
            }
            res.status(200).json(book);
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

/**
 * Récupérer les 3 livres les mieux notés
 * GET /api/books/bestrating
 */
exports.getBestRatingBooks = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 }) // tri décroissant sur la note moyenne
        .limit(3) // on limite à 3 résultats
        .then(books => {
            res.status(200).json(books);
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

/**
 * Créer un nouveau livre
 * POST /api/books
 *
 * Cette route est protégée par le middleware d'authentification.
 * Elle reçoit :
 * - un fichier image (via Multer)
 * - un champ "book" contenant les données du livre en JSON
 */
exports.createBook = (req, res, next) => {
    try {
        // Les données du livre sont envoyées sous forme de chaîne JSON
        const bookObject = JSON.parse(req.body.book);

        // On supprime l'éventuel _id et userId envoyés par le frontend par sécurité
        delete bookObject._id;
        delete bookObject.userId;

        // Création d'une nouvelle instance du modèle Book
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId, // utilisateur authentifié (venant du token)
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            averageRating: 0,
            ratings: []
        });

        // Sauvegarde du livre en base de données
        book.save()
            .then(() => {
                res.status(201).json({ message: 'Livre enregistré avec succès !' });
            })
            .catch(error => {
                res.status(400).json({ error });
            });
    } catch (error) {
        res.status(400).json({ error: 'Données invalides' });
    }
};
