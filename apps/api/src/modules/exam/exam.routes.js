import { Router } from 'express';
import { ExamController } from './exam.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { EXAM_MANAGERS } from '../../config/roles.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { subscriptionGuard } from '../../middleware/subscriptionGuard.js';
import { validate } from '../../middleware/validate.js';
import { createExamSchema, updateExamSchema, publishExamSchema } from './exam.validation.js';

const router = Router();

router.get('/', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), ExamController.list);
router.get('/:id', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), ExamController.getById);
router.post('/', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), validate(createExamSchema), ExamController.create);
router.patch('/:id', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), validate(updateExamSchema), ExamController.update);
router.delete('/:id', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), ExamController.delete);
router.post('/:id/publish', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), validate(publishExamSchema), ExamController.publish);
router.get('/:id/pdf', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), ExamController.downloadPdf);

export const examRoutes = router;
