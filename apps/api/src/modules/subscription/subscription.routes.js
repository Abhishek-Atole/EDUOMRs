import { Router } from 'express';
import { SubscriptionController } from './subscription.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { validate } from '../../middleware/validate.js';
import {
  createPlanSchema, updatePlanSchema,
  uploadPaymentSchema, verifyPaymentSchema,
} from './subscription.validation.js';

const router = Router();

// Plans (public for list, admin for mutations)
router.get('/plans', SubscriptionController.listPlans);
router.get('/plans/:id', SubscriptionController.getPlanById);
router.post('/plans', authenticate, authorize('super_admin'), validate(createPlanSchema), SubscriptionController.createPlan);
router.patch('/plans/:id', authenticate, authorize('super_admin'), validate(updatePlanSchema), SubscriptionController.updatePlan);
router.delete('/plans/:id', authenticate, authorize('super_admin'), SubscriptionController.deletePlan);

// Payments
router.post('/payments/upload', authenticate, authorize('admin'), tenantGuard, validate(uploadPaymentSchema), SubscriptionController.uploadPayment);
router.get('/payments', authenticate, authorize('admin'), SubscriptionController.listPayments);
router.patch('/payments/:id/verify', authenticate, authorize('super_admin'), validate(verifyPaymentSchema), SubscriptionController.verifyPayment);

// Subscriptions
router.get('/', authenticate, authorize('admin'), tenantGuard, SubscriptionController.getSubscription);

export const subscriptionRoutes = router;
