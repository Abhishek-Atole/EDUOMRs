import { Router } from 'express';
import { ParentController } from './parent.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { validate } from '../../middleware/validate.js';
import { createParentSchema, updateParentSchema, linkStudentSchema } from './parent.validation.js';

const router = Router();

router.get('/', authenticate, tenantGuard, authorize('admin'), ParentController.list);
router.get('/:id', authenticate, tenantGuard, authorize('admin'), ParentController.getById);
router.post('/', authenticate, tenantGuard, authorize('admin'), validate(createParentSchema), ParentController.create);
router.patch('/:id', authenticate, tenantGuard, authorize('admin'), validate(updateParentSchema), ParentController.update);
router.delete('/:id', authenticate, tenantGuard, authorize('admin'), ParentController.delete);

router.get('/:id/children', authenticate, tenantGuard, authorize('admin'), ParentController.getChildren);
router.post('/:id/children', authenticate, tenantGuard, authorize('admin'), validate(linkStudentSchema), ParentController.linkStudent);
router.delete('/:id/children/:studentId', authenticate, tenantGuard, authorize('admin'), ParentController.unlinkStudent);

export const parentRoutes = router;
