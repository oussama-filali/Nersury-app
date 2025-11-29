FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY backend/package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY backend .

# Générer le client Prisma
RUN npx prisma generate

# Exposer le port
EXPOSE 3000

# Commande de démarrage (dev par défaut)
CMD ["npm", "run", "dev"]
