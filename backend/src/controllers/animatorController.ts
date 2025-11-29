import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../middleware/errorHandler';

/**
 * Récupérer le profil de l'animateur connecté
 */
export const getMeAnimator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Non authentifié');
    }

    const animator = await prisma.animator.findUnique({
      where: { id: userId },
    });

    if (!animator) {
      throw new AppError(404, 'Animateur introuvable');
    }

    const { password, ...animatorData } = animator;

    res.status(200).json({
      status: 'success',
      data: animatorData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour le profil animateur
 */
export const updateMeAnimator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { firstname, lastname, phone, address, bio, skills, availability } = req.body;

    const updatedAnimator = await prisma.animator.update({
      where: { id: userId },
      data: {
        firstname,
        lastname,
        phone,
        address,
        bio,
        skills, // Array
        availability: availability ? JSON.stringify(availability) : undefined,
      },
    });

    const { password, ...animatorData } = updatedAnimator;

    res.status(200).json({
      status: 'success',
      data: animatorData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lister les animateurs (Public ou Parent)
 * TODO: Ajouter filtres par compétences, dispo, etc.
 */
export const listAnimators = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const animators = await prisma.animator.findMany({
      where: {
        status: 'VERIFIED', // Seuls les vérifiés sont visibles
        deletedAt: null,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true, // Peut-être masquer le nom complet en public ?
        bio: true,
        skills: true,
        rating: true,
        reviewCount: true,
        // Pas d'email, tel ou adresse en public
      },
    });

    res.status(200).json({
      status: 'success',
      data: animators,
    });
  } catch (error) {
    next(error);
  }
};
