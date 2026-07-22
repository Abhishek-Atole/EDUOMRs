import { Router } from 'express';
import { QuestionController } from './question.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { EXAM_MANAGERS } from '../../config/roles.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { subscriptionGuard } from '../../middleware/subscriptionGuard.js';
import { validate } from '../../middleware/validate.js';
import { createQuestionsSchema, updateQuestionSchema } from './question.validation.js';

const router = Router();

router.get('/exam/:examId', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), QuestionController.list);
router.post('/exam/:examId', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), validate(createQuestionsSchema), QuestionController.createMany);
router.patch('/:id', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), validate(updateQuestionSchema), QuestionController.update);
router.delete('/:id', authenticate, tenantGuard, subscriptionGuard, authorize(...EXAM_MANAGERS), QuestionController.delete);

export const questionRoutes = router;
