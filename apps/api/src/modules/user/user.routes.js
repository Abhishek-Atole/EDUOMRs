import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema } from './user.validation.js';

const router = Router();

router.get('/profile', authenticate, tenantGuard, UserController.getProfile);
router.patch('/profile', authenticate, tenantGuard, validate(updateProfileSchema), UserController.updateProfile);
router.post('/profile/change-password', authenticate, tenantGuard, validate(changePasswordSchema), UserController.changePassword);

export const userRoutes = router;
