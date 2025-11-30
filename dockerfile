FROM node:18-alpine

WORKDIR /app

# Prisma nécessite OpenSSL 1.1 sur Alpine (package via dépôt 3.18)
RUN apk add --no-cache \
	--repository=https://dl-cdn.alpinelinux.org/alpine/v3.18/main \
	--repository=https://dl-cdn.alpinelinux.org/alpine/v3.18/community \
	openssl1.1-compat

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
