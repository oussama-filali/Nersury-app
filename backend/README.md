# 🏥 Nursery Backend API

Backend sécurisé et conforme RGPD pour la plateforme **Nursery** - Solution de suivi parent-enfant-intervenant.

## 📋 Table des matières

- [Caractéristiques](#caractéristiques)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Sécurité](#sécurité)
- [Moteur d'Analyse](#moteur-danalyse)
- [Conformité RGPD](#conformité-rgpd)

---

## ✨ Caractéristiques

- ✅ **Node.js + TypeScript + Express**
- ✅ **Prisma ORM + PostgreSQL**
- ✅ **Architecture Clean / MVC**
- ✅ **Authentification JWT sécurisée (access + refresh tokens)**
- ✅ **Encryption AES-256 des données sensibles**
- ✅ **Validation stricte avec Zod**
- ✅ **Rate limiting, Helmet, CORS**
- ✅ **Moteur d'analyse non-discriminant**
- ✅ **Logs structurés (Winston)**
- ✅ **Conforme RGPD (données mineurs, consentements)**
- ✅ **Docker ready**

---

## 🏗 Architecture

```
backend/
├── src/
│   ├── config/          # Configuration DB, env, constantes
│   ├── middleware/      # Auth, validation, rate limit, errors
│   ├── models/          # Types TypeScript (générés par Prisma)
│   ├── controllers/     # Logique métier par domaine
│   ├── routes/          # Définition des endpoints REST
│   ├── services/        # Services métier (analyse, encryption...)
│   ├── utils/           # Utilitaires (hashing, JWT, logger)
│   ├── validators/      # Schémas Zod de validation
│   ├── index.ts         # Point d'entrée
│   └── server.ts        # Configuration Express
├── prisma/
│   └── schema.prisma    # Modèles de données
├── .env                 # Variables d'environnement
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Installation

### Prérequis

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **Docker** (optionnel)

### 1️⃣ Cloner et installer

```bash
cd backend
npm install
```

### 2️⃣ Configurer l'environnement

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

**Variables importantes à changer :**
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ENCRYPTION_KEY` (32 caractères exactement)

### 3️⃣ Initialiser la base de données

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4️⃣ Lancer le serveur

**Mode développement (avec hot reload) :**
```bash
npm run dev
```

**Mode production :**
```bash
npm run build
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## 🐳 Docker (optionnel)

```bash
# Depuis la racine du projet
docker-compose up -d
```

---

## ⚙️ Configuration

### Variables d'environnement (.env)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port serveur | `3000` |
| `DATABASE_URL` | Connexion PostgreSQL | `postgresql://user:pass@localhost:5432/nursery_db` |
| `JWT_SECRET` | Secret pour access tokens | `random_string_32_chars` |
| `JWT_REFRESH_SECRET` | Secret pour refresh tokens | `another_random_string` |
| `ENCRYPTION_KEY` | Clé AES-256 (32 caractères) | `abcdef1234567890abcdef1234567890` |
| `ALLOWED_ORIGINS` | Domaines CORS | `http://localhost:5173` |

---

## 🔌 API Endpoints

### 🔐 Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription (parent ou animateur) |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/refresh` | Renouveler l'access token |
| POST | `/api/auth/logout` | Déconnexion |
| POST | `/api/auth/reset-password` | Réinitialisation mot de passe |

### 👨‍👩‍👧 Parents

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/parents/me` | Profil parent connecté |
| PUT | `/api/parents/me` | Modifier son profil |
| GET | `/api/parents/me/children` | Liste des enfants du parent |

### 👶 Enfants

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/children` | Ajouter un enfant |
| GET | `/api/children/:id` | Détails d'un enfant |
| PUT | `/api/children/:id` | Modifier un enfant |
| DELETE | `/api/children/:id` | Supprimer un enfant |

### 🎓 Animateurs (Intervenants)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/animators` | Créer un profil animateur |
| GET | `/api/animators` | Liste des animateurs vérifiés |
| GET | `/api/animators/:id` | Détails d'un animateur |
| PUT | `/api/animators/:id` | Modifier son profil |
| PATCH | `/api/animators/:id/verify` | Vérifier un animateur (admin) |

### 📋 Observations

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/observations` | Créer une observation |
| GET | `/api/observations/child/:childId` | Observations d'un enfant |
| GET | `/api/observations/:id` | Détails observation |
| DELETE | `/api/observations/:id` | Supprimer observation |

### 🎯 Missions (Interventions)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/missions` | Créer une intervention |
| GET | `/api/missions/child/:childId` | Missions d'un enfant |
| GET | `/api/missions/:id` | Détails mission |
| PATCH | `/api/missions/:id/status` | Modifier statut mission |

### 💬 Chat

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/chat/send` | Envoyer un message |
| GET | `/api/chat/conversation/:userId` | Historique conversation |

### 📊 Analyse

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/analytics/run/:childId` | Lancer analyse d'un enfant |
| GET | `/api/analytics/child/:childId` | Historique analyses |

---

## 🔒 Sécurité

### 1. Authentification

- **JWT** avec expiration courte (15 min pour access token)
- **Refresh tokens** rotatifs (7 jours)
- Tokens stockés en mémoire côté client (pas de localStorage)

### 2. Encryption

- Données sensibles encryptées en AES-256 :
  - Noms enfants
  - Informations médicales
  - Adresses

### 3. Validation

- Tous les endpoints utilisent **Zod** pour valider les entrées
- Protection contre injections SQL (Prisma ORM)
- Sanitization automatique

### 4. Rate Limiting

- **50 requêtes / minute** par IP
- Protection DDoS basique

### 5. Headers sécurisés

- **Helmet.js** activé
- **CORS** restrictif (domaines autorisés uniquement)
- **Content Security Policy**

### 6. Contrôle d'accès (RBAC)

- **Parent** : accès uniquement à ses enfants
- **Animateur** : accès uniquement aux enfants assignés
- **Admin** : gestion vérifications

---

## 🧠 Moteur d'Analyse

### Principe

Le moteur d'analyse est **non-discriminant** et **non-prescriptif**. Il ne compare jamais les enfants entre eux.

### Fonctionnement

1. **Agrégation** : Récupération des observations sur période (30 jours)
2. **Normalisation** : Structuration des données
3. **Détection de patterns** :
   - Récurrences de tags (ex: "stress" répété 5 fois)
   - Intensité croissante
   - Moments sensibles (heures, jours)
4. **Synthèse textuelle** :
   - Résumé en langage naturel
   - Suggestions douces (non directives)
   - Aucun diagnostic médical

### Exemple de synthèse générée

> "Durant les deux dernières semaines, plusieurs observations liées à la gestion émotionnelle ont été relevées. Les moments les plus sensibles semblent être en fin d'après-midi. Une amélioration légère est observée sur l'autonomie. Peut-être en discuter avec l'intervenant lors de la prochaine séance."

---

## 🇪🇺 Conformité RGPD

### Données mineurs

- ✅ Consentement parental obligatoire
- ✅ Encryption des données sensibles
- ✅ Pas de profilage automatisé
- ✅ Pas de scoring algorithmique
- ✅ Droit à l'oubli implémenté
- ✅ Export des données sur demande
- ✅ Logs d'accès traçables

### Hébergement

- Données stockées **en France** (ou UE)
- Hébergeur certifié **HDS** (Hébergeur de Données de Santé) recommandé

### Audits

- Revue annuelle recommandée
- DPO (Data Protection Officer) conseillé pour production

---

## 📝 Logs

Logs structurés avec **Winston** :

- `logs/error.log` : Erreurs uniquement
- `logs/combined.log` : Tous les logs
- Console : Mode développement

---

## 🧪 Tests

```bash
npm test
```

---

## 📦 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Mode développement (hot reload) |
| `npm run build` | Compilation TypeScript |
| `npm start` | Démarrage production |
| `npm run prisma:generate` | Générer le client Prisma |
| `npm run prisma:migrate` | Créer/appliquer migrations |
| `npm run prisma:studio` | Interface graphique DB |

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

MIT License - Voir fichier [LICENSE](LICENSE)

---

## 📧 Support

Pour toute question : support@nursery.app

---

**⚠️ Important** : Ce backend traite des données sensibles de mineurs. Assurez-vous de respecter la législation en vigueur dans votre pays et de mettre en place des mesures de sécurité robustes en production.
