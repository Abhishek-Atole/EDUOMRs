import { Router } from 'express';
import { AnswerKeyController } from './answerKey.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { EXAM_MANAGERS } from '../../config/roles.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { subscriptionGuard } from '../../middleware/subscriptionGuard.js';
import { validate } from '../../middleware/validate.js';
import { uploadAnswerKeySchema } from './answerKey.validation.js';

const router = Router();

router.get('/exam/:examId', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), AnswerKeyController.get);
router.put('/exam/:examId', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), validate(uploadAnswerKeySchema), AnswerKeyController.upload);
router.delete('/exam/:examId', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), AnswerKeyController.delete);

export const answerKeyRoutes = router;
