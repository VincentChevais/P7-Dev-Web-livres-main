/**
 * Controller des livres (books)
 *
 * Ce fichier contient la logique métier liée aux livres.
 * Il gère les opérations suivantes :
 * - récupérer tous les livres
 * - récupérer un livre par son id
 * - récupérer les 3 livres les mieux notés
 * - créer un nouveau livre (avec gestion de l'image et des notes à la création)
 * - modifier un livre existant (avec remplacement de l'image si besoin)
 * - supprimer un livre (avec suppression de l'image associée)
 * - noter un livre (en empêchant les notes multiples du même utilisateur)
 *
 * La sécurité est assurée par :   
 * - l'utilisation de req.auth.userId (extrait du token JWT) pour identifier l'utilisateur
 * - la vérification que l'utilisateur est le propriétaire du livre avant modification/suppression
 * - la validation des données sensibles (notes, userId) côté serveur
 * - l'optimisation des images avec Sharp pour éviter les fichiers trop lourds
 */


const Book = require('../models/Book'); // Modèle Mongoose Book
const fs = require('fs'); // Module pour gérer les fichiers (suppression d'images)
const sharp = require('sharp'); // Module pour traiter les images (redimensionnement)
const path = require('path'); // Module pour gérer les chemins de fichiers

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
 * Création d'un nouveau livre
 * POST /api/books
 *
 * - Accepte éventuellement une note à la création
 * - Si aucune note n'est fournie : ratings = [], averageRating = 0
 * - Si une note est fournie : on initialise ratings et averageRating
 * - Ne fait pas confiance aux champs sensibles envoyés par le client
 * - Optimise l'image avec Sharp
 */
exports.createBook = async (req, res, next) => {
    try {
        // Les données du livre arrivent sous forme de string JSON à cause de Multer
        const bookObject = JSON.parse(req.body.book);

        // Sécurité : on supprime les champs qui ne doivent pas venir du client
        delete bookObject._id;
        delete bookObject.userId;

        const userId = req.auth.userId;

        let ratings = [];
        let averageRating = 0;

        // Si le frontend a envoyé une note dans ratings[0].grade
        if (Array.isArray(bookObject.ratings) && bookObject.ratings.length > 0) {
            const firstRating = bookObject.ratings[0].grade;

            // Validation de la note
            if (typeof firstRating === 'number' && firstRating > 0 && firstRating <= 5) {
                ratings = [{ userId: userId, grade: firstRating }];
                averageRating = firstRating;
                // Si firstRating === 0 (ou invalide) -> on IGNORE : pas de note à la création
            }
        }

        // On supprime les champs sensibles envoyés par le client (on les reconstruit nous-mêmes)
        delete bookObject.ratings;
        delete bookObject.averageRating;

        // ===== Traitement de l'image avec Sharp =====
        const outputFilename = `optimized_${Date.now()}.jpg`;
        const outputPath = path.join('images', outputFilename);

        await sharp(req.file.path)
            .resize(800)            // largeur max 800px
            .jpeg({ quality: 80 })  // compression
            .toFile(outputPath);

        // Suppression du fichier brut uploadé par Multer
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Erreur suppression fichier temporaire :', err);
        });

        // Création du livre
        const book = new Book({
            ...bookObject,
            userId: userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${outputFilename}`,
            ratings: ratings,
            averageRating: averageRating
        });

        // Sauvegarde en base
        await book.save();

        res.status(201).json({ message: 'Livre enregistré avec succès !' });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Erreur lors de la création du livre' });
    }
};


/**
 * Modifier un livre existant
 * PUT /api/books/:id
 *
 * - Gère le cas avec ou sans nouvelle image
 * - Si nouvelle image :
 *   - supprime l'ancienne image
 *   - optimise la nouvelle avec Sharp
 * - Vérifie que l'utilisateur est le propriétaire
 */
exports.modifyBook = async (req, res, next) => {
    try {
        let bookObject;

        // Préparer l'objet de mise à jour selon qu'il y a une image ou non
        if (req.file) {
            // Cas avec nouvelle image : les données sont dans req.body.book (string JSON)
            bookObject = JSON.parse(req.body.book);
        } else {
            // Cas sans nouvelle image : les données sont directement dans req.body
            bookObject = { ...req.body };
        }

        // Sécurité : on ne fait jamais confiance au userId venant du client
        delete bookObject.userId;

        // Récupérer le livre existant
        const book = await Book.findOne({ _id: req.params.id });
        if (!book) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }

        // Vérifier que l'utilisateur est bien le propriétaire
        if (book.userId !== req.auth.userId) {
            return res.status(403).json({ error: 'Unauthorized request' });
        }

        // Si une nouvelle image est envoyée, on gère le remplacement
        if (req.file) {
            // Supprimer l'ancienne image
            const oldFilename = book.imageUrl.split('/images/')[1];
            fs.unlink(path.join('images', oldFilename), (err) => {
                if (err) console.error('Erreur suppression ancienne image :', err);
            });

            // Générer la nouvelle image optimisée avec Sharp
            const outputFilename = `optimized_${Date.now()}.jpg`;
            const outputPath = path.join('images', outputFilename);

            await sharp(req.file.path)
                .resize(800)            // largeur max 800px
                .jpeg({ quality: 80 })  // compression
                .toFile(outputPath);

            // Supprimer le fichier brut uploadé par Multer
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Erreur suppression fichier temporaire :', err);
            });

            // Mettre à jour l'URL de l'image dans l'objet de mise à jour
            bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${outputFilename}`;
        }

        // Mise à jour du livre en base
        await Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
        );

        res.status(200).json({ message: 'Livre modifié avec succès !' });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Erreur lors de la modification du livre' });
    }
};


/**
 * Supprimer un livre
 * DELETE /api/books/:id
 *
 * Cette route :
 * - vérifie que le livre existe
 * - vérifie que l'utilisateur est le propriétaire
 * - supprime l'image associée du serveur
 * - supprime le livre de la base de données
 */
exports.deleteBook = (req, res, next) => {
    // On commence par récupérer le livre en base
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                return res.status(404).json({ error: 'Livre non trouvé' });
            }

            // Vérification que l'utilisateur authentifié est bien le propriétaire
            if (book.userId !== req.auth.userId) {
                return res.status(403).json({ error: 'Unauthorized request' });
            }

            // Récupération du nom du fichier image à partir de l'URL
            const filename = book.imageUrl.split('/images/')[1];

            // Suppression du fichier image du serveur
            fs.unlink(`images/${filename}`, (err) => {
                if (err) {
                    console.error('Erreur lors de la suppression de l’image :', err);
                }

                // Suppression du livre de la base de données
                Book.deleteOne({ _id: req.params.id })
                    .then(() => {
                        res.status(200).json({ message: 'Livre supprimé avec succès !' });
                    })
                    .catch(error => {
                        res.status(400).json({ error });
                    });
            });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

/**
 * Noter un livre
 * POST /api/books/:id/rating
 *
 * Cette route :
 * - vérifie que le livre existe
 * - vérifie que la note est entre 0 et 5
 * - empêche un utilisateur de noter deux fois le même livre
 * - ajoute la note dans le tableau ratings
 * - recalcule la moyenne averageRating
 * - sauvegarde et renvoie le livre mis à jour
 */
exports.rateBook = (req, res, next) => {
    const userId = req.auth.userId; // On utilise l'ID venant du token (sécurisé)
    const rating = req.body.rating;

    // Vérification que la note est bien entre 0 et 5
    if (rating < 0 || rating > 5) {
        return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5' });
    }

    // On récupère le livre en base
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) {
                return res.status(404).json({ error: 'Livre non trouvé' });
            }

            // Vérification que l'utilisateur n'a pas déjà noté ce livre
            const alreadyRated = book.ratings.find(r => r.userId === userId);
            if (alreadyRated) {
                return res.status(400).json({ error: 'Vous avez déjà noté ce livre' });
            }

            // Ajout de la nouvelle note dans le tableau ratings
            book.ratings.push({ userId: userId, grade: rating });

            // Recalcul de la moyenne des notes
            const sum = book.ratings.reduce((acc, curr) => acc + curr.grade, 0);
            const average = sum / book.ratings.length;
            book.averageRating = Math.round(average * 10) / 10; // Arrondi à 1 décimale

            // Sauvegarde du livre mis à jour
            book.save()
                .then(updatedBook => {
                    // On renvoie le livre mis à jour en réponse
                    res.status(200).json(updatedBook);
                })
                .catch(error => {
                    res.status(400).json({ error });
                });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

