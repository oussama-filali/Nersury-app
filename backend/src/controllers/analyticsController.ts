import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { runAnalysisForChild } from '../services/analysisService';

/**
 * Lancer une analyse manuelle pour un enfant
 */
export const runAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { childId } = req.body;
    const userId = req.user?.userId;

    // Vérifier que l'enfant appartient au parent
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child || child.parentId !== userId) {
      throw new AppError(403, 'Accès refusé');
    }

    // Lancer le moteur d'analyse
    const analysisResult = await runAnalysisForChild(childId);

    res.status(200).json({
      status: 'success',
      data: analysisResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer l'historique des analyses
 */
export const getAnalyticsHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { childId } = req.params;
    const userId = req.user?.userId;

    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child || child.parentId !== userId) {
      throw new AppError(403, 'Accès refusé');
    }

    const analytics = await prisma.analytic.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};
