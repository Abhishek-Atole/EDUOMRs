import { Router } from 'express';
import { QuestionController } from './question.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { validate } from '../../middleware/validate.js';
import { createQuestionsSchema, updateQuestionSchema } from './question.validation.js';

const router = Router();

router.get('/exam/:examId', authenticate, tenantGuard, authorize('teacher'), QuestionController.list);
router.post('/exam/:examId', authenticate, tenantGuard, authorize('teacher'), validate(createQuestionsSchema), QuestionController.createMany);
router.patch('/:id', authenticate, tenantGuard, authorize('teacher'), validate(updateQuestionSchema), QuestionController.update);
router.delete('/:id', authenticate, tenantGuard, authorize('teacher'), QuestionController.delete);

export const questionRoutes = router;
