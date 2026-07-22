import { Router } from 'express';
import { SubmissionController } from './submission.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { subscriptionGuard } from '../../middleware/subscriptionGuard.js';
import { validate } from '../../middleware/validate.js';
import { saveAnswerSchema, bulkSaveSchema } from './submission.validation.js';

const router = Router();

router.post('/:sessionId/save', authenticate, tenantGuard, subscriptionGuard, authorize('student'), validate(saveAnswerSchema), SubmissionController.saveAnswer);
router.post('/:sessionId/bulk-save', authenticate, tenantGuard, subscriptionGuard, authorize('student'), validate(bulkSaveSchema), SubmissionController.bulkSave);
router.post('/:sessionId/submit', authenticate, tenantGuard, subscriptionGuard, authorize('student'), SubmissionController.submit);
router.get('/:sessionId/summary', authenticate, tenantGuard, subscriptionGuard, authorize('student'), SubmissionController.getSummary);

export const submissionRoutes = router;
