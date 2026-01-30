/**
 * Fichier server.js
 *
 * Ce fichier est responsable du démarrage du serveur HTTP.
 * Il écoute les requêtes entrantes et les transmet à l'application Express.
 */
const http = require('http'); // Module HTTP natif de Node.js
const app = require('./app'); // Import de l'app Express configurée dans app.js

/**
 * Normalise la valeur du port afin de garantir qu'il est valide.
 * Cela évite des erreurs lors du démarrage du serveur.
 */
const normalizePort = val => {
    const port = parseInt(val, 10); // Conversion en entier

    if (isNaN(port)) { // Cas rare. Pipe nommé
        return val;
    }
    if (port >= 0) { // Port valide
        return port;
    }
    return false; // Port non valide refusé
};

// Définition du port d'écoute (variable d'environnement ou valeur par défaut)
const port = normalizePort(process.env.PORT || '4000');
app.set('port', port); // Configuration du port dans l'app Express

/**
 * Gestion des erreurs liées au serveur HTTP.
 * Permet d'afficher des messages clairs en cas de problème.
 */
const errorHandler = error => {
    if (error.syscall !== 'listen') { // Erreur non liée à l'écoute
        throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
        case 'EACCES': // Erreur de permission
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE': // Erreur d'adresse déjà utilisée
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

// Création du serveur HTTP à partir de l'application Express
const server = http.createServer(app);

// Écoute des erreurs serveur
server.on('error', errorHandler);

// Événement déclenché lorsque le serveur est prêt
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

// Lancement du serveur
server.listen(port);
