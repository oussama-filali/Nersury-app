/**
 * Système de logs structurés avec Winston
 * Logs sécurisés (pas de données sensibles)
 */

import winston from 'winston';
import config from '../config/env';
import path from 'path';

/**
 * Format personnalisé pour les logs
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Ajouter les métadonnées si présentes
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
  })
);

/**
 * Configuration du logger Winston
 */
const logger = winston.createLogger({
  level: config.logLevel,
  format: customFormat,
  defaultMeta: { service: 'nursery-api' },
  transports: [
    // Logs d'erreurs dans un fichier séparé
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5 MB
      maxFiles: 5,
    }),
    
    // Tous les logs dans combined.log
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5 MB
      maxFiles: 10,
    }),
  ],
  
  // Ne pas planter l'app en cas d'erreur de log
  exitOnError: false,
});

/**
 * En développement, afficher aussi les logs dans la console
 */
if (config.isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

/**
 * Helper pour logger les actions utilisateur (audit trail)
 * ⚠️ Ne jamais logger de données sensibles (noms, adresses, infos médicales)
 */
export const logUserAction = (
  userId: string,
  userType: 'PARENT' | 'ANIMATOR' | 'ADMIN',
  action: string,
  resource: string,
  metadata?: Record<string, any>
) => {
  logger.info('User action', {
    userId,
    userType,
    action,
    resource,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};

/**
 * Logger les erreurs avec contexte
 */
export const logError = (
  error: Error,
  context?: Record<string, any>
) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

/**
 * Logger les tentatives de connexion (sécurité)
 */
export const logAuthAttempt = (
  email: string,
  success: boolean,
  userType: string,
  ip?: string
) => {
  logger.info('Authentication attempt', {
    email: email.substring(0, 3) + '***', // Email partiellement masqué
    success,
    userType,
    ip,
    timestamp: new Date().toISOString(),
  });
};

export default logger;
