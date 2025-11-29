/**
 * Middleware de gestion des erreurs globale
 * Capture toutes les erreurs non gérées et renvoie une réponse appropriée
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logError } from '../utils/logger';
import config from '../config/env';

/**
 * Classe d'erreur personnalisée
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware de gestion des erreurs global
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Logger l'erreur
  logError(err, {
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
  });

  // Erreur personnalisée (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Erreurs Prisma (base de données)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Violation de contrainte unique
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') || 'champ';
      res.status(409).json({
        success: false,
        message: `Ce ${field} existe déjà.`,
      });
      return;
    }

    // Enregistrement non trouvé
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Ressource non trouvée.',
      });
      return;
    }

    // Erreur de relation (foreign key)
    if (err.code === 'P2003') {
      res.status(400).json({
        success: false,
        message: 'Relation invalide dans les données.',
      });
      return;
    }
  }

  // Erreur Prisma de validation
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: 'Données invalides pour la base de données.',
    });
    return;
  }

  // Erreur générique (ne pas exposer les détails en production)
  res.status(500).json({
    success: false,
    message: config.isProduction
      ? 'Une erreur interne est survenue.'
      : err.message,
    ...(config.isDevelopment && { stack: err.stack }),
  });
};

/**
 * Middleware pour capturer les routes non trouvées (404)
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée : ${req.method} ${req.path}`,
  });
};

/**
 * Wrapper async pour éviter les try/catch répétitifs
 * Capture automatiquement les erreurs et les passe au middleware d'erreur
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
