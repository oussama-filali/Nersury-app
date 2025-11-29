import { Router } from 'express';
import authRoutes from './authRoutes';
import parentRoutes from './parentRoutes';
import childRoutes from './childRoutes';
import animatorRoutes from './animatorRoutes';
import missionRoutes from './missionRoutes';
import observationRoutes from './observationRoutes';
import chatRoutes from './chatRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/parents', parentRoutes);
router.use('/children', childRoutes);
router.use('/animators', animatorRoutes);
router.use('/missions', missionRoutes);
router.use('/observations', observationRoutes);
router.use('/chat', chatRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
