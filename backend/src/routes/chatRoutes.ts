import { Router } from 'express';
import { sendMessage, getMissionMessages } from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/send', sendMessage);
router.get('/mission/:missionId', getMissionMessages);

export default router;
