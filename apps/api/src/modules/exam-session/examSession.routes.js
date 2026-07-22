import { Router } from 'express';
import { ExamSessionController } from './examSession.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { EXAM_MANAGERS } from '../../config/roles.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { subscriptionGuard } from '../../middleware/subscriptionGuard.js';

const router = Router();

router.get('/:examId/start', authenticate, tenantGuard, subscriptionGuard, authorize('student'), ExamSessionController.start);
router.post('/:examId/start', authenticate, tenantGuard, subscriptionGuard, authorize('student'), ExamSessionController.start);
router.get('/:examId/omr', authenticate, tenantGuard, subscriptionGuard, authorize('student'), ExamSessionController.getOmrData);
router.get('/:examId/active', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), ExamSessionController.getActiveSessions);

export const examSessionRoutes = router;
