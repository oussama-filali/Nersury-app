import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../middleware/errorHandler';

/**
 * Récupérer le profil du parent connecté
 */
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Non authentifié');
    }

    const parent = await prisma.parent.findUnique({
      where: { id: userId },
      include: {
        children: true, // Inclure les enfants
      },
    });

    if (!parent) {
      throw new AppError(404, 'Parent introuvable');
    }

    // Exclure le mot de passe
    const { password, ...parentData } = parent;

    res.status(200).json({
      status: 'success',
      data: parentData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour le profil
 */
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { firstname, lastname, phone, address } = req.body;

    const updatedParent = await prisma.parent.update({
      where: { id: userId },
      data: {
        firstname,
        lastname,
        phone,
        address,
      },
    });

    const { password, ...parentData } = updatedParent;

    res.status(200).json({
      status: 'success',
      data: parentData,
    });
  } catch (error) {
    next(error);
  }
};
