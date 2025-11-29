/**
 * Middleware d'authentification JWT
 * V�rifie la validit� des tokens et extrait les informations utilisateur
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader, JwtPayload } from '../utils/jwt';
import { logAuthAttempt } from '../utils/logger';

/**
 * �tendre l'interface Request pour inclure les donn�es utilisateur
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware d'authentification principal
 * V�rifie le token JWT dans le header Authorization
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extraire le token du header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token manquant. Authentification requise.',
      });
      return;
    }
    
    // V�rifier et d�coder le token
    const decoded = verifyAccessToken(token);
    
    // Attacher les donn�es utilisateur � la requ�te
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      logAuthAttempt(req.ip || 'unknown', false, error.message);
      
      if (error.message === 'Token expired') {
        res.status(401).json({
          success: false,
          message: 'Token expir�. Veuillez vous reconnecter.',
          code: 'TOKEN_EXPIRED',
        });
        return;
      }
      
      if (error.message === 'Invalid token') {
        res.status(401).json({
          success: false,
          message: 'Token invalide.',
          code: 'INVALID_TOKEN',
        });
        return;
      }
    }
    
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expir�',
    });
  }
};

/**
 * Middleware d'autorisation par r�le
 * @param roles - Liste des r�les autoris�s
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Accès interdit : droits insuffisants',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware optionnel : authentification sans �chec
 * Attache l'utilisateur s'il est connect�, sinon continue
 * Utile pour des routes publiques avec contenu personnalis� si connect�
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // Ignorer l'erreur, l'utilisateur n'est juste pas authentifi�
  }
  
  next();
};
