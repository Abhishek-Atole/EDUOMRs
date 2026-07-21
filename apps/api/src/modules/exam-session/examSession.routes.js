import { Router } from 'express';
import { ExamSessionController } from './examSession.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { tenantGuard } from '../../middleware/tenant.js';

const router = Router();

router.get('/:examId/start', authenticate, tenantGuard, authorize('student'), ExamSessionController.start);
router.post('/:examId/start', authenticate, tenantGuard, authorize('student'), ExamSessionController.start);
router.get('/:examId/omr', authenticate, tenantGuard, authorize('student'), ExamSessionController.getOmrData);
router.get('/:examId/active', authenticate, tenantGuard, authorize('teacher'), ExamSessionController.getActiveSessions);

export const examSessionRoutes = router;
