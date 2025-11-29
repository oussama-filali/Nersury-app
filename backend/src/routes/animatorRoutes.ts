import { Router } from 'express';
import { getMeAnimator, updateMeAnimator, listAnimators } from '../controllers/animatorController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public (ou authentifié basique)
router.get('/', listAnimators);

// Routes protégées animateur
router.use(authenticate);
router.use(authorize(['animator']));

router.get('/me', getMeAnimator);
router.put('/me', updateMeAnimator);

export default router;
