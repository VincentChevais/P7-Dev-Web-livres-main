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

/**
 * INSCRIPTION (signup)
 * Cette fonction permet de créer un nouvel utilisateur.
 * Le mot de passe n'est JAMAIS stocké en clair :
 * il est hashé avec bcrypt avant d'être enregistré en base de données.
 */
exports.signup = (req, res, next) => {
    /**
   * bcrypt.hash() permet de transformer un mot de passe en hash irréversible.
   * - req.body.password : mot de passe envoyé par l'utilisateur
   * - 10 : nombre de "salt rounds" (coût de calcul)
   *   Plus le nombre est élevé, plus le hash est sécurisé mais lent.
   */
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            /**
            * Une fois le mot de passe hashé, on crée un nouvel utilisateur.
            * On stocke uniquement le hash en base, jamais le mot de passe en clair.
            */
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // Enregistrement de l'utilisateur dans MongoDB
            return user.save();
        })
        .then(() => {
            // Réponse envoyée si la création de l'utilisateur s'est bien passée
            res.status(201).json({ message: 'Utilisateur créé !' });
        })
        .catch(error => {
            // Gestion des erreurs (email déjà existant, données invalides, etc.)
            res.status(400).json({ error });
        });
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
exports.login = (req, res, next) => {
    // Recherche de l'utilisateur dans la base par son email
    User.findOne({ email: req.body.email })
        .then(user => {
            // Si l'utilisateur n'existe pas, on renvoie une erreur 401 (non autorisé)
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé' });
            }

            // L'utilisateur existe, on compare le mot de passe fourni avec le hash en base
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // Si le mot de passe est incorrect, on renvoie une erreur 401
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect' });
                    }

                    // Authentification réussie : on génère un token JWT
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
                });
        })
        .catch(error => res.status(500).json({ error })); // Erreur serveur
};


