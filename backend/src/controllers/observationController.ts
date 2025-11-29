import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../middleware/errorHandler';

/**
 * Créer une observation (Rapport)
 */
export const createObservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const { childId, category, intensity, description, tags } = req.body;

    // Vérifier les droits d'accès à l'enfant
    if (role === 'parent') {
      const child = await prisma.child.findUnique({ where: { id: childId } });
      if (!child || child.parentId !== userId) throw new AppError(403, 'Accès refusé');
    } else if (role === 'animator') {
      // Vérifier s'il y a une mission (passée ou future) avec cet enfant
      const mission = await prisma.mission.findFirst({
        where: {
          childId,
          animatorId: userId,
          status: { in: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'] },
        },
      });
      if (!mission) throw new AppError(403, 'Vous ne pouvez pas créer d\'observation pour cet enfant');
    }

    const observation = await prisma.observation.create({
      data: {
        childId,
        authorType: role === 'parent' ? 'PARENT' : 'ANIMATOR',
        parentId: role === 'parent' ? userId : undefined,
        animatorId: role === 'animator' ? userId : undefined,
        category,
        intensity,
        description,
        tags: tags || [],
      },
    });

    res.status(201).json({
      status: 'success',
      data: observation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les observations d'un enfant
 */
export const getObservationsByChild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { childId } = req.params;
    const userId = req.user?.userId;
    const role = req.user?.role;

    // Vérification accès
    if (role === 'parent') {
      const child = await prisma.child.findUnique({ where: { id: childId } });
      if (!child || child.parentId !== userId) throw new AppError(403, 'Accès refusé');
    } else if (role === 'animator') {
       const mission = await prisma.mission.findFirst({
        where: {
          childId,
          animatorId: userId,
          status: { in: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'] },
        },
      });
      if (!mission) throw new AppError(403, 'Accès refusé');
    }

    const observations = await prisma.observation.findMany({
      where: { childId },
      orderBy: { observedAt: 'desc' },
      include: {
        animator: { select: { firstname: true, lastname: true } },
      },
    });

    res.status(200).json({
      status: 'success',
      data: observations,
    });
  } catch (error) {
    next(error);
  }
};
