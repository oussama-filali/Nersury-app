import { Router } from 'express';
import { createObservation, getObservationsByChild } from '../controllers/observationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createObservation);
router.get('/child/:childId', getObservationsByChild);

export default router;
