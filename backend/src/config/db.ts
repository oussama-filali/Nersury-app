/**
 * Configuration de la base de données (Prisma)
 * Gestion de la connexion PostgreSQL avec retry automatique
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

/**
 * Instance globale du client Prisma
 * Singleton pour éviter les connexions multiples
 */
const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Logs des warnings et erreurs Prisma
prisma.$on('warn', (e) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

/**
 * Connexion à la base de données avec retry
 */
export const connectDatabase = async (): Promise<void> => {
  const maxRetries = 5;
  const retryDelay = 3000; // 3 secondes

  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      logger.info('✅ Base de données connectée avec succès');
      return;
    } catch (error) {
      logger.error(`❌ Échec de connexion à la DB (tentative ${i + 1}/${maxRetries})`);
      
      if (i === maxRetries - 1) {
        logger.error('❌ Impossible de se connecter à la base de données après plusieurs tentatives');
        throw error;
      }
      
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

/**
 * Déconnexion propre de la base de données
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('✅ Déconnexion de la base de données réussie');
  } catch (error) {
    logger.error('❌ Erreur lors de la déconnexion de la DB', error);
    throw error;
  }
};

/**
 * Health check de la base de données
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('❌ Health check DB échoué', error);
    return false;
  }
};

export default prisma;
