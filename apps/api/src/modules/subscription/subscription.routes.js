import { Router } from 'express';
import { SubscriptionController } from './subscription.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { PLATFORM_ADMINS, TENANT_ADMINS } from '../../config/roles.js';
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
router.post('/plans', authenticate, authorize(...PLATFORM_ADMINS), validate(createPlanSchema), SubscriptionController.createPlan);
router.patch('/plans/:id', authenticate, authorize(...PLATFORM_ADMINS), validate(updatePlanSchema), SubscriptionController.updatePlan);
router.delete('/plans/:id', authenticate, authorize(...PLATFORM_ADMINS), SubscriptionController.deletePlan);

// Payments
router.post('/payments/upload', authenticate, authorize(...TENANT_ADMINS), tenantGuard, validate(uploadPaymentSchema), SubscriptionController.uploadPayment);
router.get('/payments', authenticate, authorize(...TENANT_ADMINS), SubscriptionController.listPayments);
router.patch('/payments/:id/verify', authenticate, authorize(...PLATFORM_ADMINS), validate(verifyPaymentSchema), SubscriptionController.verifyPayment);

// Subscriptions
router.get('/', authenticate, authorize(...TENANT_ADMINS), tenantGuard, SubscriptionController.getSubscription);

export const subscriptionRoutes = router;
