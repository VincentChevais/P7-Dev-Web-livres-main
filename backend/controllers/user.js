/**
 * Controller utilisateur – INSCRIPTION (signup)
 *
 * Cette fonction permet de créer un nouvel utilisateur.
 * Le mot de passe n'est JAMAIS stocké en clair :
 * il est hashé avec bcrypt avant d'être enregistré en base de données.
 */

const bcrypt = require('bcrypt'); // Librairie de hachage sécurisé des mots de passe
const User = require('../models/User'); // Modèle Mongoose User

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
