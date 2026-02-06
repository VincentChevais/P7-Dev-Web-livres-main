/**
 * Middleware Multer
 *
 * Ce fichier configure la gestion de l'upload des fichiers images.
 * Il définit :
 * - où stocker les fichiers
 * - comment les renommer
 * - quels types de fichiers sont acceptés
 */

const multer = require('multer');

// Dictionnaire des types MIME acceptés et leurs extensions
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

/**
 * Configuration du stockage des fichiers
 */
const storage = multer.diskStorage({
    // Dossier de destination des fichiers uploadés
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    // Génération du nom de fichier
    filename: (req, file, callback) => {
        // On remplace les espaces par des underscores
        const name = file.originalname.split(' ').join('_');
        // On récupère l'extension à partir du type MIME
        const extension = MIME_TYPES[file.mimetype];
        // Nom final : nom + timestamp + extension
        callback(null, name + Date.now() + '.' + extension);
    }
});

// Export du middleware configuré pour un seul fichier "image"
module.exports = multer({ storage: storage }).single('image');
