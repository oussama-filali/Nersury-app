import { Router } from 'express';
import { createMission, getMissions, updateMissionStatus } from '../controllers/missionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['parent']), createMission);
router.get('/', getMissions);
router.patch('/:id/status', updateMissionStatus);

export default router;
