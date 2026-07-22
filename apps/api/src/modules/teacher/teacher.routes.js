import { Router } from 'express';
import { TeacherController } from './teacher.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { TENANT_ADMINS } from '../../config/roles.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { validate } from '../../middleware/validate.js';
import { createTeacherSchema, updateTeacherSchema } from './teacher.validation.js';

const router = Router();

router.get('/', authenticate, tenantGuard, authorize(...TENANT_ADMINS), TeacherController.list);
router.get('/:id', authenticate, tenantGuard, authorize(...TENANT_ADMINS), TeacherController.getById);
router.post('/', authenticate, tenantGuard, authorize(...TENANT_ADMINS), validate(createTeacherSchema), TeacherController.create);
router.patch('/:id', authenticate, tenantGuard, authorize(...TENANT_ADMINS), validate(updateTeacherSchema), TeacherController.update);
router.delete('/:id', authenticate, tenantGuard, authorize(...TENANT_ADMINS), TeacherController.delete);

export const teacherRoutes = router;
