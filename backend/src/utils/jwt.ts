/**
 * Utilitaire JWT (JSON Web Tokens)
 * Gestion des access tokens et refresh tokens
 */

import jwt from 'jsonwebtoken';
import config from '../config/env';
import logger from './logger';

/**
 * Payload du JWT (données stockées dans le token)
 */
export interface JwtPayload {
  userId: string;
  role: 'parent' | 'animator' | 'admin'; // Harmonisé avec le reste de l'app (lowercase)
  email?: string;
}

/**
 * Générer un access token (courte durée : 15 min)
 * @param payload - Données utilisateur
 * @returns Access token signé
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  try {
    return jwt.sign(payload, config.jwt.secret as string, {
      expiresIn: config.jwt.accessExpiry as jwt.SignOptions['expiresIn'],
      issuer: 'nursery-api',
      audience: 'nursery-app',
    });
  } catch (error) {
    logger.error('Erreur lors de la génération de l\'access token', error);
    throw new Error('Token generation failed');
  }
};

/**
 * Générer un refresh token (longue durée : 7 jours)
 * @param payload - Données utilisateur
 * @returns Refresh token signé
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  try {
    return jwt.sign(payload, config.jwt.refreshSecret as string, {
      expiresIn: config.jwt.refreshExpiry as jwt.SignOptions['expiresIn'],
      issuer: 'nursery-api',
      audience: 'nursery-app',
    });
  } catch (error) {
    logger.error('Erreur lors de la génération du refresh token', error);
    throw new Error('Token generation failed');
  }
};

/**
 * Générer la paire de tokens (Access + Refresh)
 * @param payload - Données utilisateur
 */
export const generateTokens = (payload: JwtPayload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};

/**
 * Vérifier et décoder un access token
 * @param token - Token à vérifier
 * @returns Payload décodé
 * @throws Error si le token est invalide ou expiré
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'nursery-api',
      audience: 'nursery-app',
    }) as JwtPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Vérifier et décoder un refresh token
 * @param token - Refresh token à vérifier
 * @returns Payload décodé
 * @throws Error si le token est invalide ou expiré
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'nursery-api',
      audience: 'nursery-app',
    }) as JwtPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
};

/**
 * Extraire le token du header Authorization
 * Format attendu : "Bearer <token>"
 * @param authHeader - Header Authorization
 * @returns Token extrait ou null
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Retirer "Bearer "
};

/**
 * Générer une paire de tokens (access + refresh)
 * @param payload - Données utilisateur
 * @returns Objet contenant access token et refresh token
 */
export const generateTokenPair = (payload: JwtPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
