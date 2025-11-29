# Agenda & Analyse - Nursery Backend

_Date:_ 29 Novembre 2025

## Contexte & État actuel
- 📦 **Backend TypeScript** complet : architectures MVC, Prisma, JWT, chiffrement AES, Docker.
- 🧪 **Tests** : compilation `npm run build` OK, Jest (unitaires) OK, test runtime `registerParent` OK via DB Docker.
- 🐳 **Docker** : PostgreSQL tourne (via Docker Desktop), migrations appliquées, backend en mode dev connecté.
- 📄 **Docs** : `docs/TODO.md` tient le suivi macro; agenda détaillé ajouté ici.

## Analyse des Points Restants
1. **Auth complet** : endpoints `/login` & `/refresh-token` non testés en réel.
2. **Modules métier** : routes `child`, `mission`, `chat`, `analytics` jamais exercées (nécessitent payloads précis et dépendances Prisma).
3. **Gestion documents & vérification animateurs** : pas encore reliée (pas de modèle Document, pas de flux admin).
4. **Seed/fixtures** : aucune donnée par défaut (admin, animateurs certifiés, enfants de test).
5. **Docker Compose complet** : jamais lancé avec backend+db ensemble, seulement DB seule.
6. **Observabilité** : pas d’outils (Swagger, Postman collection versionnée, logger vers fichier/monitoring).

## Agenda - Aujourd'hui (Jour J)
1. **Tester les endpoints Auth restants**
   - `/api/v1/auth/login` avec le parent créé (PowerShell `Invoke-RestMethod`).
   - `/api/v1/auth/refresh-token` avec tokens retournés.
2. **Tester un flux Parent → Enfant → Mission**
   - Créer un enfant (`/api/v1/children`).
   - Créer une mission (`/api/v1/missions`).
   - Vérifier la validation (Zod) et les relations Prisma.
3. **Valider le middleware de chat**
   - Créer un message parent → animateur (mock d’un animateur).
   - Confirmer la persistance en base.
4. **Documenter la procédure de test**
   - Ajouter un fichier `docs/TESTING.md` (ou compléter README) avec commandes exactes.
5. **Mettre à jour `docs/TODO.md`**
   - Cocher les étapes réalisées ci-dessus.

## Agenda - Demain (J+1)
1. **Docker Compose complet**
   - Lancer `docker-compose up --build` (backend + postgres).
   - Tester santé via `http://localhost:3000/health` depuis l’hôte.
2. **Script de seed Prisma**
   - Générer `prisma/seed.ts` (admin + animateur vérifié + parent + enfant).
   - Ajouter script `npm run seed` dans `package.json`.
3. **Sécurisation avancée**
   - Ajouter table `Document` pour les vérifications (casier, diplôme).
   - Étendre `Animator` pour stocker statut de validation.
4. **Payments & Intégrations**
   - Lancer maquette Stripe (clé test, session checkout ou payment intent).
   - Préparer architecture pour futurs partenariats (CAF, assurances) via champs additionnels.
5. **Documentation & Observabilité**
   - Générer Swagger/OpenAPI (via `swagger-jsdoc` ou `tsdoc`).
   - Créer fichier `docs/API.md` + scripts Postman.
   - Configurer Winston pour exporter vers fichiers/date rotative.

## Suivi & Prochaines actions
- ✅ Dès maintenant : exécuter l’agenda d’aujourd’hui et mettre à jour `docs/TODO.md`.
- 🕘 Demain matin : attaquer Docker Compose + seed, puis les features d’intégration.
- 📝 Chaque étape doit être commitée avec messages clairs (ex: `feat(auth): test login flow`).

_Note : garder Docker Desktop actif et surveiller les ports (3000/5432)._
