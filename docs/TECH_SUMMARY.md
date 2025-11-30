# Nursery Backend - Résumé Technique (niveau junior)

## 1. Ce que nous avons construit
- **Backend TypeScript/Express** structuré en `controllers / routes / services / middleware`.
- **Prisma + PostgreSQL** pour la base de données (lancée via Docker Desktop).
- **Sécurité** : JWT (access + refresh), chiffrement AES des données sensibles, Bcrypt pour les mots de passe.
- **Fonctionnalités principales déjà opérationnelles** :
  - Auth (inscription parent, login, refresh token).
  - Gestion des enfants (création, listing, update, delete).
  - Missions parent → animateur (création, statut).
  - Chat temps différé parent/animateur (persisté en base).

## 2. Préparation de l'environnement
1. **Docker Desktop** démarré → PostgreSQL via `docker-compose.yml` (port 5432).
2. **Variables d'environnement** dans `backend/.env` (voir `src/config/env.ts`).
3. **Migration** : `cd backend; npx prisma migrate deploy`.
4. **Lancement serveur** : `cd backend; npm run dev` (log "Base de données connectée").
5. **Docker Compose complet** : `docker-compose up -d --build` (l'image installe `openssl1.1-compat` pour Prisma et charge `backend/.env` via `env_file`).
6. **Health check conteneur** : `curl http://localhost:3000/health` depuis l'hôte → `{"status":"ok"}`.

## 3. Tests réalisés (commandes exactes)
Toutes les requêtes ont été envoyées depuis PowerShell avec `Invoke-RestMethod`.

### 3.1 Auth
```powershell
# Login (POST)
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' `
  -Method Post -ContentType 'application/json' `
  -Body '{"email":"parent.demo@example.com","password":"Password123!","role":"parent"}'

# Refresh Token (POST)
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/refresh-token' `
  -Method Post -ContentType 'application/json' `
  -Body '{"refreshToken":"<TOKEN>"}'
```
Résultat : réponse `status: success` avec user + tokens.

### 3.2 Enfant + Mission
```powershell
# Créer un enfant (POST /api/v1/children)
$token = <access token>
$childPayload = @{ firstname = "Lila"; lastname = "Demo"; birthdate = "2019-05-01"; `
                  medicalInfo = @{ allergies = "Arachides" }; specialNeeds = "Besoin d'une AVS" } `
                  | ConvertTo-Json -Depth 4
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/children' `
  -Method Post -Headers @{ Authorization = "Bearer $token" } `
  -ContentType 'application/json' -Body $childPayload

# Créer une mission (POST /api/v1/missions)
$missionPayload = @{ childId = '<ID enfant>'; startTime = (Get-Date).AddHours(2).ToString('o'); `
                    endTime = (Get-Date).AddHours(5).ToString('o'); notes = 'Garde urgence soirée' } |
                    ConvertTo-Json -Depth 4
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/missions' `
  -Method Post -Headers @{ Authorization = "Bearer $token" } `
  -ContentType 'application/json' -Body $missionPayload
```
Résultat : enfant créé (données chiffrées côté DB) + mission `PENDING` stockée.

### 3.3 Chat
```powershell
# Envoyer un message (POST /api/v1/chat/send)
$chatPayload = @{ missionId = '<ID mission>'; content = 'Bonsoir, merci de confirmer.' } `
                | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/chat/send' `
  -Method Post -Headers @{ Authorization = "Bearer $token" } `
  -ContentType 'application/json' -Body $chatPayload

# Récupérer l'historique (GET /api/v1/chat/mission/:missionId)
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/chat/mission/<ID mission>" `
  -Method Get -Headers @{ Authorization = "Bearer $token" }
```
Résultat : message stocké (`senderType: PARENT`) et retour via GET.

## 4. Ce qui marche (preuves)
- Logs serveur : `✅ Base de données connectée`, `🚀 Serveur démarré sur le port 3000`.
- Réponses API : toutes renvoient `status: success` + data attendue.
- La base PostgreSQL contient maintenant : parent, tokens, enfant Lila, mission, message.
- Stack Docker : `docker-compose logs backend` affiche la connexion DB réussie et `docker-compose ps` expose les ports `3000/5432`.

## 5. Ce qu’il reste à faire
- Ajouter un script Prisma `seed` (admin, animateur vérifié, parent, enfant).
- Générer une documentation API (Swagger, Postman ou `docs/API.md`).
- Couvrir les routes restantes (analytics, observation, parent) avec des tests seedés.
- Étendre la partie animateur (upload documents, validation admin, Stripe, etc.).
- Préparer une checklist RGPD + scénarios d'erreurs (404/500) pour la QA.

## 6. Conseils pour un junior
- Toujours vérifier que Docker Desktop est vert avant `npm run dev`.
- Utiliser `Invoke-RestMethod` (ou Postman) pour tester chaque endpoint.
- Garder les tokens JWT à portée (access pour requêtes, refresh pour renouveler).
- Lire `docs/TODO.md` et `docs/AGENDA.md` chaque matin pour connaître la priorité.
- Committer souvent avec un message clair (`feat`, `fix`, `docs`, etc.).
