# Mon Vieux Grimoire — Backend

Backend de l'application "Mon Vieux Grimoire", développé avec Node.js, Express et MongoDB.

---

## Fonctionnalités

- Authentification utilisateur (signup / login)
- Sécurisation avec JWT
- Gestion des livres (CRUD)
- Upload et optimisation des images (Multer + Sharp)
- Notation des livres
- Protection contre les attaques brute force (rate limiting)

---

## Technologies utilisées

- Node.js
- Express
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- bcrypt
- Multer
- Sharp

---

## Installation

### 1. Cloner le projet

Dans un terminal :

```bash
git clone <URL_DU_REPO>
cd backend
```

### 2. Installer les dépendances

Dans un terminal :

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier .env à la racine

```env
PORT=4000
MONGO_USER=your_user
MONGO_PASSWORD=your_password
MONGO_CLUSTER=cluster.mongodb.net
MONGO_DB=monvieuxgrimoire
JWT_SECRET=your_secret_key
```
Les informations de connexion à MongoDB sont à récupérer sur MongoDB Atlas (bouton "Connect").

Le nom de la base de données (MONGO_DB) est à définir librement.

Ne jamais commit le fichier .env (à ajouter dans .gitignore)

### 4. Lancer le serveur

Dans un terminal :

```bash
npm start
```

Le serveur démarre sur :
`http://localhost:4000`

---

## Scripts

- npm start : lance le serveur
- npm run dev : lance avec nodemon

---

## Structure du projet

├── controllers/   # Logique métier
├── models/        # Schémas Mongoose
├── routes/        # Définition des routes
├── middleware/    # Middlewares (auth, validation, upload)
├── utils/         # Fonctions utilitaires
├── images/        # Images uploadées
├── app.js
└── server.js

---

## API

### Authentification
- `POST /api/auth/signup` -> Création d’un compte utilisateur
- `POST /api/auth/login` -> Connexion utilisateur

### Livres

#### Routes publiques
- `GET /api/books` -> Récupérer tous les livres
- `GET /api/books/bestrating` -> Récupérer les 3 livres les mieux notés
- `GET /api/books/:id` -> Récupérer un livre par son ID

#### Routes protégées (authentification requise)
- `POST /api/books` -> Créer un nouveau livre
- `PUT /api/books/:id` -> Modifier un livre
- `DELETE /api/books/:id` -> Supprimer un livre
- `POST /api/books/:id/rating` -> Noter un livre

---

## Authentification

Les routes protégées nécessitent un token JWT dans le header :

Authorization: Bearer TOKEN

---

## Gestion des images

- Upload via Multer
- Optimisation avec Sharp
- Stockage local dans /images
- Accès via : http://localhost:4000/images/nom_image.jpg

---

## Gestion des erreurs

- Middleware global de gestion des erreurs
- Messages personnalisés pour :
  - validation
  - authentification
  - erreurs métier

---

## Sécurité

- Hash des mots de passe avec bcrypt
- Vérification JWT
- Validation des données côté backend
- Rate limiting sur les routes d’authentification

---

## About

Projet réalisé par Vincent Chevais
Dans le cadre du projet 6 de la formation Web Developper d'OpenClassroom.


