import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../middleware/errorHandler';

/**
 * Créer une demande de mission (Parent)
 */
export const createMission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parentId = req.user?.userId;
    const { childId, animatorId, startTime, endTime, notes } = req.body;

    if (!parentId) throw new AppError(401, 'Non authentifié');

    // Vérifier que l'enfant appartient au parent
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child || child.parentId !== parentId) {
      throw new AppError(400, 'Enfant invalide');
    }

    // Vérifier l'animateur
    if (animatorId) {
      const animator = await prisma.animator.findUnique({ where: { id: animatorId } });
      if (!animator || animator.status !== 'VERIFIED') {
        throw new AppError(400, 'Animateur invalide ou non disponible');
      }
    }

    const mission = await prisma.mission.create({
      data: {
        parentId,
        childId,
        animatorId, // Peut être null si c'est une demande ouverte (marketplace)
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notesParent: notes,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      status: 'success',
      data: mission,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les missions (Parent ou Animateur)
 */
export const getMissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    const whereClause: any = {};
    if (role === 'parent') {
      whereClause.parentId = userId;
    } else if (role === 'animator') {
      whereClause.animatorId = userId;
    }

    const missions = await prisma.mission.findMany({
      where: whereClause,
      include: {
        child: {
          select: { id: true, firstname: true }, // Attention firstname est encrypté, à gérer
        },
        animator: role === 'parent' ? { select: { firstname: true, lastname: true } } : false,
        parent: role === 'animator' ? { select: { firstname: true, lastname: true, address: true } } : false,
      },
      orderBy: { startTime: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      data: missions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour le statut d'une mission (Accepter, Refuser, Terminer)
 */
export const updateMissionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;
    const role = req.user?.role;

    const mission = await prisma.mission.findUnique({ where: { id } });
    if (!mission) throw new AppError(404, 'Mission introuvable');

    // Vérification des droits
    if (role === 'animator') {
      if (mission.animatorId !== userId) throw new AppError(403, 'Accès refusé');
      // Animateur peut passer de PENDING -> ACCEPTED/DECLINED, ou IN_PROGRESS -> COMPLETED
    } else if (role === 'parent') {
      if (mission.parentId !== userId) throw new AppError(403, 'Accès refusé');
      // Parent peut CANCEL
    }

    const updatedMission = await prisma.mission.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({
      status: 'success',
      data: updatedMission,
    });
  } catch (error) {
    next(error);
  }
};
