import { Router } from 'express';
import { TeacherController } from './teacher.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { validate } from '../../middleware/validate.js';
import { createTeacherSchema, updateTeacherSchema } from './teacher.validation.js';

const router = Router();

router.get('/', authenticate, tenantGuard, authorize('admin'), TeacherController.list);
router.get('/:id', authenticate, tenantGuard, authorize('admin'), TeacherController.getById);
router.post('/', authenticate, tenantGuard, authorize('admin'), validate(createTeacherSchema), TeacherController.create);
router.patch('/:id', authenticate, tenantGuard, authorize('admin'), validate(updateTeacherSchema), TeacherController.update);
router.delete('/:id', authenticate, tenantGuard, authorize('admin'), TeacherController.delete);

export const teacherRoutes = router;
