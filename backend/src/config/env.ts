/**
 * Configuration des variables d'environnement
 * Validation et chargement sécurisé avec valeurs par défaut
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Charger le fichier .env
dotenv.config();

/**
 * Schéma de validation des variables d'environnement
 * Toutes les variables critiques sont vérifiées au démarrage
 */
const envSchema = z.object({
  // Serveur
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  HOST: z.string().default('0.0.0.0'),

  // Base de données
  DATABASE_URL: z.string().url('DATABASE_URL doit être une URL PostgreSQL valide'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET doit faire au moins 32 caractères'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Encryption (AES-256 nécessite 32 caractères)
  ENCRYPTION_KEY: z.string().length(32, 'ENCRYPTION_KEY doit faire exactement 32 caractères'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('50'),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  // Logs
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'), // 5 MB
  UPLOAD_DIR: z.string().default('./uploads'),

  // OpenAI (optionnel)
  OPENAI_API_KEY: z.string().optional(),
});

/**
 * Validation et parsing des variables d'environnement
 */
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Erreur de configuration des variables d\'environnement :');
    error.errors.forEach((err) => {
      console.error(`   - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

/**
 * Configuration exportée (typée et validée)
 */
export const config = {
  // Serveur
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',

  // Base de données
  databaseUrl: env.DATABASE_URL,

  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },

  // Encryption
  encryptionKey: env.ENCRYPTION_KEY,

  // Rate limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  // CORS
  allowedOrigins: env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),

  // Logs
  logLevel: env.LOG_LEVEL,

  // Upload
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    uploadDir: env.UPLOAD_DIR,
  },

  // OpenAI
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
} as const;

export default config;
