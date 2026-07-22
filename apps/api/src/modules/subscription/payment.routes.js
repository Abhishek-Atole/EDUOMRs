import { Router } from 'express';
import { SubscriptionController } from './subscription.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { PLATFORM_ADMINS, TENANT_ADMINS } from '../../config/roles.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { validate } from '../../middleware/validate.js';
import { uploadPaymentSchema, verifyPaymentSchema } from './subscription.validation.js';

const router = Router();

router.post('/upload', authenticate, authorize(...TENANT_ADMINS), tenantGuard, validate(uploadPaymentSchema), SubscriptionController.uploadPayment);
router.get('/', authenticate, authorize(...TENANT_ADMINS), SubscriptionController.listPayments);
router.patch('/:id/verify', authenticate, authorize(...PLATFORM_ADMINS), validate(verifyPaymentSchema), SubscriptionController.verifyPayment);

export const paymentRoutes = router;
