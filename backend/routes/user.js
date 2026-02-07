/**
 * Routes utilisateur
 *
 * Ce fichier définit les routes liées à l'authentification des utilisateurs.
 * Il ne contient aucune logique métier : il fait uniquement le lien
 * entre les requêtes HTTP et les controllers.
 */

const express = require('express');
const router = express.Router();

// Import du controller utilisateur
const userCtrl = require('../controllers/user');

// Import des middlewares de validation
const { validateSignup } = require('../middleware/validators');

/**
 * Route d'inscription (signup)
 * Méthode : POST
 * URL finale : /api/auth/signup
 * Cette route appelle la fonction signup du controller utilisateur.
 */
router.post('/signup', validateSignup, userCtrl.signup);

/**
 * Route de connexion (login)
 * Méthode : POST
 * URL finale : /api/auth/login
 * Cette route appelle la fonction login du controller utilisateur.
 */
router.post('/login', userCtrl.login);

// Export du routeur pour l'utiliser dans app.js
module.exports = router;
