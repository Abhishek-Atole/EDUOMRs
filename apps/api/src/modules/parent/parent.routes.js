import { Router } from 'express';
import { ParentController } from './parent.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { TENANT_ADMINS } from '../../config/roles.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { validate } from '../../middleware/validate.js';
import { createParentSchema, updateParentSchema, linkStudentSchema } from './parent.validation.js';

const router = Router();

router.get('/', authenticate, tenantGuard, authorize(...TENANT_ADMINS), ParentController.list);
router.get('/:id', authenticate, tenantGuard, authorize(...TENANT_ADMINS), ParentController.getById);
router.post('/', authenticate, tenantGuard, authorize(...TENANT_ADMINS), validate(createParentSchema), ParentController.create);
router.patch('/:id', authenticate, tenantGuard, authorize(...TENANT_ADMINS), validate(updateParentSchema), ParentController.update);
router.delete('/:id', authenticate, tenantGuard, authorize(...TENANT_ADMINS), ParentController.delete);

router.get('/:id/children', authenticate, tenantGuard, authorize(...TENANT_ADMINS), ParentController.getChildren);
router.post('/:id/children', authenticate, tenantGuard, authorize(...TENANT_ADMINS), validate(linkStudentSchema), ParentController.linkStudent);
router.delete('/:id/children/:studentId', authenticate, tenantGuard, authorize(...TENANT_ADMINS), ParentController.unlinkStudent);

export const parentRoutes = router;
