import { Router } from 'express';
import { StudentController } from './student.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { validate } from '../../middleware/validate.js';
import { createStudentSchema, updateStudentSchema } from './student.validation.js';

const router = Router();

router.get('/', authenticate, tenantGuard, authorize('admin'), StudentController.list);
router.get('/:id', authenticate, tenantGuard, authorize('admin'), StudentController.getById);
router.post('/', authenticate, tenantGuard, authorize('admin'), validate(createStudentSchema), StudentController.create);
router.patch('/:id', authenticate, tenantGuard, authorize('admin'), validate(updateStudentSchema), StudentController.update);
router.delete('/:id', authenticate, tenantGuard, authorize('admin'), StudentController.delete);

export const studentRoutes = router;
