/**
 * Modèle Mongoose : User
 *
 * Ce modèle définit la structure d'un utilisateur dans la base MongoDB.
 * Il permet de valider les données et de créer la collection correspondante.
 */
const mongoose = require('mongoose');


/**
 * Schéma utilisateur
 * - email : adresse email unique et obligatoire
 * - password : mot de passe hashé avec bcrypt (jamais en clair)
 */
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true, // L'email est obligatoire
        unique: true // Un seul utilisateur par email
    },
    password: {
        type: String,
        required: true // Le mot de passe est obligatoire
    }
});

/**
 * Création et export du modèle User.
 * Mongoose crée automatiquement la collection "users" en base de données.
 * Permet d'utiliser User.save(), User.find()... dans les controllers
 */
module.exports = mongoose.model('User', userSchema);
