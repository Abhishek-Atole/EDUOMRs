import { Router } from 'express';
import { SubscriptionController } from './subscription.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { createPlanSchema, updatePlanSchema } from './subscription.validation.js';

const router = Router();

router.get('/', SubscriptionController.listPlans);
router.get('/:id', SubscriptionController.getPlanById);
router.post('/', authenticate, authorize('super_admin'), validate(createPlanSchema), SubscriptionController.createPlan);
router.patch('/:id', authenticate, authorize('super_admin'), validate(updatePlanSchema), SubscriptionController.updatePlan);
router.delete('/:id', authenticate, authorize('super_admin'), SubscriptionController.deletePlan);

export const planRoutes = router;
