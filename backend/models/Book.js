/**
 * Modèle Mongoose : Book
 *
 * Ce modèle définit la structure d'un livre dans la base de données.
 * Il est utilisé pour créer, lire, modifier et supprimer des livres.
 */

const mongoose = require('mongoose');

/**
 * Schéma pour une note (rating)
 * Chaque note contient :
 * - userId : l'identifiant de l'utilisateur qui a noté
 * - grade : la note donnée (nombre)
 */
const ratingSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    grade: {
        type: Number,
        required: true
    }
}, { _id: false }); // On désactive l'_id automatique pour les sous-documents

/**
 * Schéma principal Book
 * Il décrit la structure complète d'un livre en base de données.
 */
const bookSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true // Identifiant de l'utilisateur qui a créé le livre
    },
    title: {
        type: String,
        required: true // Titre du livre
    },
    author: {
        type: String,
        required: true // Auteur du livre
    },
    imageUrl: {
        type: String,
        required: true // URL de l'image stockée sur le serveur
    },
    year: {
        type: Number,
        required: true // Année de publication
    },
    genre: {
        type: String,
        required: true // Genre du livre
    },
    ratings: {
        type: [ratingSchema],
        default: [] // Tableau de notes (vide par défaut)
    },
    averageRating: {
        type: Number,
        default: 0 // Moyenne des notes (0 par défaut)
    }
});

/**
 * Création et export du modèle Book.
 * Mongoose créera automatiquement la collection "books" en base de données.
 */
module.exports = mongoose.model('Book', bookSchema);
