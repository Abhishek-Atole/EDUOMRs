import { Router } from 'express';
import { InstitutionController } from './institution.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { PLATFORM_ADMINS, TENANT_ADMINS } from '../../config/roles.js';
import { validate } from '../../middleware/validate.js';
import { updateInstitutionSchema } from './institution.validation.js';

const router = Router();

router.get('/', authenticate, authorize(...PLATFORM_ADMINS), InstitutionController.list);
router.get('/:id', authenticate, authorize(...TENANT_ADMINS), InstitutionController.getById);
router.patch('/:id', authenticate, authorize(...PLATFORM_ADMINS), validate(updateInstitutionSchema), InstitutionController.update);
router.delete('/:id', authenticate, authorize(...PLATFORM_ADMINS), InstitutionController.delete);

export const institutionRoutes = router;
