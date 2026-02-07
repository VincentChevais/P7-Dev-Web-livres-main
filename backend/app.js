/**
 * Configuration principale de l'application Express
 *
 * Ce fichier configure :
 * - la connexion à MongoDB
 * - les middlewares globaux (JSON, CORS)
 * - le service des fichiers statiques (images)
 * - le montage des routes
 */

require('dotenv').config(); // Chargement des variables d'environnement

const express = require('express');     // Framework web Express
const mongoose = require('mongoose');   // ODM pour MongoDB
const path = require('path');           // Gestion des chemins de fichiers
const cors = require('cors');           // Middleware CORS
const rateLimit = require('express-rate-limit'); // Middleware de limitation de débit

const userRoutes = require('./routes/user'); // Routes utilisateur (auth)
const bookRoutes = require('./routes/book'); // Routes livres

const app = express();

/**
 * Middleware pour parser le JSON.
 * Permet d'accéder au body des requêtes via req.body
 */
app.use(express.json());

/**
 * Middleware CORS
 * Autorise les requêtes cross-origin (ex: frontend sur localhost:3000)
 */
app.use(cors());

/**
 * Connexion à la base de données MongoDB via Mongoose.
 * L'URI est stockée dans le fichier .env pour des raisons de sécurité.
 */
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

/** * Middleware de limitation de débit pour les routes d'authentification
 * Limite à 100 requêtes par IP toutes les 15 minutes
 * Permet de protéger contre les attaques par force brute
 */
app.use('/api/auth', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

/**
 * Middleware pour servir les fichiers images statiques
 * Les images sont accessibles via /images/nom_du_fichier
 */
app.use('/images', express.static(path.join(__dirname, 'images')));

/**
 * Routes d'authentification
 * Préfixe : /api/auth
 */
app.use('/api/auth', userRoutes);

/**
 * Routes des livres
 * Préfixe : /api/books
 */
app.use('/api/books', bookRoutes);

/**
 * Middleware de gestion des erreurs
 * Ce middleware doit être défini après tous les autres middlewares et routes
 * Il capture les erreurs lancées dans les controllers et renvoie une réponse JSON
 */
app.use((error, req, res, next) => {
    console.error(error);

    const status = error.statusCode || 500;
    const message = error.message || 'Erreur serveur';

    res.status(status).json({ error: message });
});


module.exports = app;
