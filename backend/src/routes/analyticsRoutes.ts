import { Router } from 'express';
import { runAnalysis, getAnalyticsHistory } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize(['parent'])); // Seul le parent peut voir/lancer les analyses pour l'instant

router.post('/run', runAnalysis);
router.get('/history/:childId', getAnalyticsHistory);

export default router;
