import { Router } from 'express';
import { ResultController } from './result.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { EXAM_MANAGERS } from '../../config/roles.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { subscriptionGuard } from '../../middleware/subscriptionGuard.js';

const router = Router();

router.post('/exam/:examId/release', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), ResultController.release);
router.post('/exam/:examId/recalculate', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), ResultController.recalculate);
router.get('/exam/:examId/my', authenticate, tenantGuard, subscriptionGuard, authorize('student'), ResultController.getMyResult);
router.get('/exam/:examId', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), ResultController.list);
router.get('/exam/:examId/leaderboard', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), ResultController.leaderboard);
router.get('/exam/:examId/analytics', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), ResultController.analytics);
router.get('/:id', authenticate, tenantGuard, subscriptionGuard, authorize('student'), ResultController.getUserResult);

export const resultRoutes = router;
