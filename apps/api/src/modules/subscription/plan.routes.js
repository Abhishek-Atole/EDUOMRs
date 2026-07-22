import { Router } from 'express';
import { SubscriptionController } from './subscription.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { PLATFORM_ADMINS } from '../../config/roles.js';
import { validate } from '../../middleware/validate.js';
import { createPlanSchema, updatePlanSchema } from './subscription.validation.js';

const router = Router();

router.get('/', SubscriptionController.listPlans);
router.get('/:id', SubscriptionController.getPlanById);
router.post('/', authenticate, authorize(...PLATFORM_ADMINS), validate(createPlanSchema), SubscriptionController.createPlan);
router.patch('/:id', authenticate, authorize(...PLATFORM_ADMINS), validate(updatePlanSchema), SubscriptionController.updatePlan);
router.delete('/:id', authenticate, authorize(...PLATFORM_ADMINS), SubscriptionController.deletePlan);

export const planRoutes = router;
