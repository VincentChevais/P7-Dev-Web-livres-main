const fs = require('fs');

/**
 * Helper pour créer une erreur HTTP proprement
 * - Supprime le fichier uploadé s'il existe
 * - Attache un statusCode à l'erreur
 * - Lance l'erreur pour qu'elle soit captée par Express
 */
exports.throwError = (req, statusCode, message) => {
    // Nettoyage du fichier uploadé si présent
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Erreur suppression fichier uploadé :', err);
            }
        });
    }

    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
};
