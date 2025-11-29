import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { hashPassword, comparePassword } from '../utils/hashing';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Inscription d'un nouveau parent
 */
export const registerParent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstname, lastname, phone, address } = req.body;

    // Vérifier si l'email existe déjà
    const existingParent = await prisma.parent.findUnique({ where: { email } });
    if (existingParent) {
      throw new AppError(409, 'Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer le parent
    const parent = await prisma.parent.create({
      data: {
        email,
        password: hashedPassword,
        firstname,
        lastname,
        phone,
        address,
      },
    });

    // Générer les tokens
    const tokens = generateTokens({ userId: parent.id, role: 'parent' });

    logger.info(`Nouveau parent inscrit : ${email}`);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: parent.id,
          email: parent.email,
          firstname: parent.firstname,
          lastname: parent.lastname,
          role: 'parent',
        },
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Inscription d'un nouvel animateur
 */
export const registerAnimator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstname, lastname, phone, address, bio, skills } = req.body;

    const existingAnimator = await prisma.animator.findUnique({ where: { email } });
    if (existingAnimator) {
      throw new AppError(409, 'Cet email est déjà utilisé');
    }

    const hashedPassword = await hashPassword(password);

    const animator = await prisma.animator.create({
      data: {
        email,
        password: hashedPassword,
        firstname,
        lastname,
        phone,
        address,
        bio,
        skills: skills || [], // Array of strings
        identityVerified: false, // Par défaut non vérifié
      },
    });

    const tokens = generateTokens({ userId: animator.id, role: 'animator' });

    logger.info(`Nouvel animateur inscrit : ${email}`);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: animator.id,
          email: animator.email,
          firstname: animator.firstname,
          lastname: animator.lastname,
          role: 'animator',
          verified: animator.identityVerified,
        },
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connexion (Parent ou Animateur)
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role } = req.body; // role: 'parent' | 'animator'

    if (!role || !['parent', 'animator'].includes(role)) {
      throw new AppError(400, 'Le rôle (parent ou animator) est requis');
    }

    let user;
    if (role === 'parent') {
      user = await prisma.parent.findUnique({ where: { email } });
    } else {
      user = await prisma.animator.findUnique({ where: { email } });
    }

    if (!user || !(await comparePassword(password, user.password))) {
      throw new AppError(401, 'Email ou mot de passe incorrect');
    }

    const tokens = generateTokens({ userId: user.id, role });

    logger.info(`Connexion réussie : ${email} (${role})`);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role,
        },
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rafraîchir le token d'accès
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(400, 'Refresh token requis');
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new AppError(401, 'Refresh token invalide ou expiré');
    }

    // Vérifier si l'utilisateur existe toujours
    let user;
    if (decoded.role === 'parent') {
      user = await prisma.parent.findUnique({ where: { id: decoded.userId } });
    } else {
      user = await prisma.animator.findUnique({ where: { id: decoded.userId } });
    }

    if (!user) {
      throw new AppError(401, 'Utilisateur introuvable');
    }

    const tokens = generateTokens({ userId: user.id, role: decoded.role });

    res.status(200).json({
      status: 'success',
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
};
