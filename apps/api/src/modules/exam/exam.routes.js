import { Router } from 'express';
import { ExamController } from './exam.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { validate } from '../../middleware/validate.js';
import { createExamSchema, updateExamSchema, publishExamSchema } from './exam.validation.js';

const router = Router();

router.get('/', authenticate, tenantGuard, authorize('teacher'), ExamController.list);
router.get('/:id', authenticate, tenantGuard, authorize('teacher'), ExamController.getById);
router.post('/', authenticate, tenantGuard, authorize('teacher'), validate(createExamSchema), ExamController.create);
router.patch('/:id', authenticate, tenantGuard, authorize('teacher'), validate(updateExamSchema), ExamController.update);
router.delete('/:id', authenticate, tenantGuard, authorize('teacher'), ExamController.delete);
router.post('/:id/publish', authenticate, tenantGuard, authorize('teacher'), validate(publishExamSchema), ExamController.publish);
router.get('/:id/pdf', authenticate, tenantGuard, authorize('teacher'), ExamController.downloadPdf);

export const examRoutes = router;
