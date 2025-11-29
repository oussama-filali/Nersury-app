import { Router } from 'express';
import { registerParent, registerAnimator, login, refreshToken } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Schémas de validation
const registerParentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  role: z.enum(['parent', 'animator']),
});

router.post('/register/parent', validate(registerParentSchema), registerParent);
router.post('/register/animator', registerAnimator); // Ajouter validation
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshToken);

export default router;
