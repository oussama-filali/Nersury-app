/**
 * Middleware de rate limiting
 * Protection contre les abus et attaques DDoS
 */

import rateLimit from 'express-rate-limit';
import config from '../config/env';
import logger from '../utils/logger';

/**
 * Rate limiter général (appliqué à toutes les routes)
 * 50 requêtes par minute par IP
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    
    res.status(429).json({
      success: false,
      message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
    });
  },
});

/**
 * Rate limiter strict pour l'authentification
 * 5 tentatives par 15 minutes (protection brute force)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
  },
  skipSuccessfulRequests: true, // Ne compte que les échecs
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email,
    });
    
    res.status(429).json({
      success: false,
      message: 'Trop de tentatives de connexion. Compte temporairement bloqué.',
    });
  },
});

/**
 * Rate limiter modéré pour les créations (POST)
 * 10 créations par 5 minutes
 */
export const createLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: {
    success: false,
    message: 'Trop de créations. Veuillez patienter quelques minutes.',
  },
});

/**
 * Rate limiter pour les analyses (ressource intensive)
 * 3 analyses par 10 minutes
 */
export const analyticsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    success: false,
    message: 'Limite d\'analyses atteinte. Veuillez réessayer dans 10 minutes.',
  },
  handler: (req, res) => {
    logger.warn('Analytics rate limit exceeded', {
      ip: req.ip,
      userId: req.user?.userId,
    });
    
    res.status(429).json({
      success: false,
      message: 'Limite d\'analyses atteinte. Cette opération est coûteuse.',
    });
  },
});
