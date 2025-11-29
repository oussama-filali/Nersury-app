/**
 * Middleware de validation avec Zod
 * Valide les données des requêtes (body, query, params)
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import logger from '../utils/logger';

/**
 * Middleware générique de validation Zod
 * @param schema - Schéma Zod à valider
 * @param source - Source des données à valider ('body', 'query', 'params')
 */
export const validate = (
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Valider les données
      const validated = await schema.parseAsync(req[source]);
      
      // Remplacer les données par les données validées
      req[source] = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formater les erreurs Zod de manière lisible
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn('Validation error', { errors, source });
        
        res.status(400).json({
          success: false,
          message: 'Erreur de validation des données',
          errors,
        });
        return;
      }
      
      logger.error('Unexpected validation error', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la validation',
      });
    }
  };
};

/**
 * Middleware de validation spécifique pour le body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Middleware de validation spécifique pour les query params
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');

/**
 * Middleware de validation spécifique pour les params d'URL
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
