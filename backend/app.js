/**
 * Configuration principale de l'application Express
 *
 * Ce fichier configure l'application backend :
 * - connexion à la base de données MongoDB
 * - middlewares globaux (JSON, CORS)
 * - déclaration des routes
 */
require('dotenv').config(); // Chargement des variables d'environnement

const express = require('express'); // Framework web Express
const mongoose = require('mongoose'); // ODM pour MongoDB
const userRoutes = require('./routes/user'); // Routes utilisateur
const bookRoutes = require('./routes/book'); // Routes livres
const auth = require('./middleware/auth'); // Middleware d'authentification
const path = require('path'); // Module pour gérer les chemins de fichiers

const app = express();

/**
 * Middleware permettant de parser les requêtes JSON.
 * Il transforme le body JSON en objet JavaScript accessible via req.body.
 */
app.use(express.json());

/**
 * Connexion à la base de données MongoDB via Mongoose.
 * L'URI est stockée dans le fichier .env pour des raisons de sécurité.
 */
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

/**
 * Middleware CORS
 * Autorise les requêtes provenant de n'importe quelle origine (*)
 * et précise les headers et méthodes HTTP autorisés.
 * Indispensable pour permettre la communication avec le frontend.
 */
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

/**
 * Routes d'authentification
 * Toutes les routes définies dans userRoutes sont accessibles
 * via le préfixe /api/auth.
 */
app.use('/api/auth', userRoutes);

/**
 * Routes des livres
 * Toutes les routes définies dans bookRoutes sont accessibles
 * via le préfixe /api/books.
 */
app.use('/api/books', bookRoutes);

/**
 * Middleware pour servir les fichiers images statiques
 * Les images de couverture des livres sont accessibles via /images/nom_du_fichier
 */
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
