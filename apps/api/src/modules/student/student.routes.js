import { Router } from 'express';
import { StudentController } from './student.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { TENANT_ADMINS } from '../../config/roles.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { validate } from '../../middleware/validate.js';
import { createStudentSchema, updateStudentSchema } from './student.validation.js';

const router = Router();

router.get('/', authenticate, tenantGuard, authorize(...TENANT_ADMINS), StudentController.list);
router.get('/:id', authenticate, tenantGuard, authorize(...TENANT_ADMINS), StudentController.getById);
router.post('/', authenticate, tenantGuard, authorize(...TENANT_ADMINS), validate(createStudentSchema), StudentController.create);
router.patch('/:id', authenticate, tenantGuard, authorize(...TENANT_ADMINS), validate(updateStudentSchema), StudentController.update);
router.delete('/:id', authenticate, tenantGuard, authorize(...TENANT_ADMINS), StudentController.delete);

export const studentRoutes = router;
