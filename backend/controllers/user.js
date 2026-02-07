/**
 * Controller utilisateur 
 * 
 * Ce fichier contient la logique métier liée à l'authentification :
 * - inscription des utilisateurs (signup)
 * - connexion des utilisateurs (login)
 *
 * La sécurité est assurée par :
 * - bcrypt pour le hachage et la vérification des mots de passe
 * - JWT (JSON Web Token) pour l'authentification des requêtes protégées
 */

const bcrypt = require('bcrypt'); // Librairie de hachage sécurisé des mots de passe
const User = require('../models/User'); // Modèle Mongoose User
const jwt = require('jsonwebtoken'); // Librairie de gestion des tokens d'authentification
const { throwError } = require('../utils/errorHandler'); // Utilitaire de gestion des erreurs

/**
 * INSCRIPTION (signup)
 * Cette fonction permet de créer un nouvel utilisateur.
 * Le mot de passe n'est JAMAIS stocké en clair :
 * il est hashé avec bcrypt avant d'être enregistré en base de données.
 */
exports.signup = async (req, res, next) => {
    try {
        /**
         * bcrypt.hash() transforme le mot de passe en hash irréversible.
         * - req.body.password : mot de passe envoyé par l'utilisateur
         * - 10 : nombre de "salt rounds" (coût de calcul)
         */
        const hash = await bcrypt.hash(req.body.password, 10);

        /**
         * Création du nouvel utilisateur.
         * On stocke uniquement le hash en base, jamais le mot de passe en clair.
         */
        const user = new User({
            email: req.body.email,
            password: hash
        });

        // Enregistrement de l'utilisateur dans MongoDB
        await user.save();

        // Réponse envoyée si la création s'est bien passée
        res.status(201).json({ message: 'Utilisateur créé !' });

    } catch (error) {
        /**
         * Les erreurs techniques (MongoDB, bcrypt, etc.) sont transmises
         * au middleware global qui renverra une 500 par défaut.
         * Les erreurs de validation sont normalement déjà gérées
         * par le middleware validators en amont.
         */
        next(error);
    }
};


/**
 * CONNEXION (login)
 *
 * Cette fonction permet d'authentifier un utilisateur existant.
 * Elle vérifie que l'email existe en base, puis compare le mot de passe
 * fourni avec le hash stocké grâce à bcrypt.
 *
 * Si l'authentification réussit, un token JWT est généré et renvoyé
 * au frontend. Ce token sera utilisé pour sécuriser les routes protégées.
 */
exports.login = async (req, res, next) => {
    try {
        // Recherche de l'utilisateur dans la base par son email
        const user = await User.findOne({ email: req.body.email });

        // Si l'utilisateur n'existe pas, erreur d'authentification
        if (!user) {
            throwError(req, 401, 'Utilisateur non trouvé');
        }

        // Comparaison du mot de passe fourni avec le hash en base
        const valid = await bcrypt.compare(req.body.password, user.password);

        // Si le mot de passe est incorrect, erreur d'authentification
        if (!valid) {
            throwError(req, 401, 'Mot de passe incorrect');
        }

        // Authentification réussie : génération du token JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // On renvoie l'ID utilisateur et le token au frontend
        res.status(200).json({
            userId: user._id,
            token: token
        });

    } catch (error) {
        // Toute erreur technique (MongoDB, bcrypt, jwt, etc.) est transmise au middleware global
        next(error);
    }
};


