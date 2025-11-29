import { Router } from 'express';
import { getMe, updateMe } from '../controllers/parentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize(['parent']));

router.get('/me', getMe);
router.put('/me', updateMe);

export default router;
