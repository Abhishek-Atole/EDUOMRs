import { Router } from 'express';
import { InstitutionController } from './institution.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import { updateInstitutionSchema } from './institution.validation.js';

const router = Router();

router.get('/', authenticate, authorize('super_admin'), InstitutionController.list);
router.get('/:id', authenticate, authorize('admin'), InstitutionController.getById);
router.patch('/:id', authenticate, authorize('super_admin'), validate(updateInstitutionSchema), InstitutionController.update);
router.delete('/:id', authenticate, authorize('super_admin'), InstitutionController.delete);

export const institutionRoutes = router;
