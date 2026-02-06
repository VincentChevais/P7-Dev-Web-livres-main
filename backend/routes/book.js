/**
 * Routes des livres (books)
 *
 * Ce fichier définit tous les endpoints liés aux livres.
 * Il ne contient aucune logique métier : chaque route délègue
 * le traitement au controller correspondant.
 */

const express = require('express');
const router = express.Router();

// Middleware d'authentification JWT (toutes les routes books sont protégées)
const auth = require('../middleware/auth');

// Middleware de gestion des fichiers (images de couverture)
const multer = require('../middleware/multer-config');

// Controller des livres 
const bookCtrl = require('../controllers/book');

/**
 * Récupérer tous les livres (PUBLIC)
 * GET /api/books
 */
router.get('/', bookCtrl.getAllBooks);

/**
 * Récupérer les 3 livres les mieux notés (PUBLIC)
 * GET /api/books/bestrating
 */
router.get('/bestrating', bookCtrl.getBestRatingBooks);

/**
 * Récupérer un livre par son id (PUBLIC)
 * GET /api/books/:id
 */
router.get('/:id', bookCtrl.getOneBook);



/**
 * Créer un nouveau livre (PRIVÉ)
 * POST /api/books
 */
router.post('/', auth, multer, bookCtrl.createBook);

/**
 * Modifier un livre existant (PRIVÉ)
 * PUT /api/books/:id
 */
router.put('/:id', auth, multer, bookCtrl.modifyBook);

/**
 * Supprimer un livre (PRIVÉ)
 * DELETE /api/books/:id
 */
router.delete('/:id', auth, bookCtrl.deleteBook);

/**
 * Noter un livre (PRIVÉ)
 * POST /api/books/:id/rating
 */
router.post('/:id/rating', auth, bookCtrl.rateBook);

// Export du routeur
module.exports = router;
