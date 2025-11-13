import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getMe, listUsers } from '../controllers/user.controller.js';

const router = Router();

// Current user
router.get('/me', requireAuth, getMe);

// Admin-only example list
router.get('/', requireAuth, requireRole('admin'), listUsers);

export default router;
