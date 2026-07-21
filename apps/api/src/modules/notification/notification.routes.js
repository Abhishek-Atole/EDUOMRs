import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { tenantGuard } from '../../middleware/tenant.js';

const router = Router();

router.post('/exam/:examId/send-results', authenticate, tenantGuard, authorize('teacher'), NotificationController.sendResults);

export const notificationRoutes = router;
