import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../middleware/errorHandler';

/**
 * Envoyer un message
 */
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const { missionId, content } = req.body;

    const mission = await prisma.mission.findUnique({ where: { id: missionId } });
    if (!mission) throw new AppError(404, 'Mission introuvable');

    // Vérifier que l'utilisateur fait partie de la mission
    if (role === 'parent' && mission.parentId !== userId) throw new AppError(403, 'Accès refusé');
    if (role === 'animator' && mission.animatorId !== userId) throw new AppError(403, 'Accès refusé');

    const message = await prisma.chatMessage.create({
      data: {
        missionId,
        content,
        senderType: role === 'parent' ? 'PARENT' : 'ANIMATOR',
        receiverType: role === 'parent' ? 'ANIMATOR' : 'PARENT',
        senderParentId: role === 'parent' ? userId : undefined,
        senderAnimatorId: role === 'animator' ? userId : undefined,
        receiverParentId: role === 'animator' ? mission.parentId : undefined,
        receiverAnimatorId: role === 'parent' ? mission.animatorId : undefined,
      },
    });

    res.status(201).json({
      status: 'success',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer la conversation d'une mission
 */
export const getMissionMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { missionId } = req.params;
    const userId = req.user?.userId;
    const role = req.user?.role;

    const mission = await prisma.mission.findUnique({ where: { id: missionId } });
    if (!mission) throw new AppError(404, 'Mission introuvable');

    if (role === 'parent' && mission.parentId !== userId) throw new AppError(403, 'Accès refusé');
    if (role === 'animator' && mission.animatorId !== userId) throw new AppError(403, 'Accès refusé');

    const messages = await prisma.chatMessage.findMany({
      where: { missionId },
      orderBy: { sentAt: 'asc' },
    });

    res.status(200).json({
      status: 'success',
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
