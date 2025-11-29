import { Router } from 'express';
import { createChild, getMyChildren, getChild, updateChild, deleteChild } from '../controllers/childController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Routes accessibles aux parents
router.post('/', authorize(['parent']), createChild);
router.get('/', authorize(['parent']), getMyChildren);
router.put('/:id', authorize(['parent']), updateChild);
router.delete('/:id', authorize(['parent']), deleteChild);

// Accessible aux parents et animateurs (avec restrictions dans le contrôleur)
router.get('/:id', getChild);

export default router;
