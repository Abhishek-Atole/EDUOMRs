import { Router } from 'express';
import { ResultController } from './result.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { tenantGuard } from '../../middleware/tenant.js';

const router = Router();

router.post('/exam/:examId/release', authenticate, tenantGuard, authorize('teacher'), ResultController.release);
router.post('/exam/:examId/recalculate', authenticate, tenantGuard, authorize('teacher'), ResultController.recalculate);
router.get('/exam/:examId/my', authenticate, tenantGuard, authorize('student'), ResultController.getMyResult);
router.get('/exam/:examId', authenticate, tenantGuard, authorize('teacher'), ResultController.list);
router.get('/exam/:examId/leaderboard', authenticate, tenantGuard, authorize('teacher'), ResultController.leaderboard);
router.get('/exam/:examId/analytics', authenticate, tenantGuard, authorize('teacher'), ResultController.analytics);
router.get('/:id', authenticate, tenantGuard, authorize('student'), ResultController.getUserResult);

export const resultRoutes = router;
