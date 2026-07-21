import { Router } from 'express';
import { AcademicController } from './academic.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';
import { tenantGuard } from '../../middleware/tenant.js';
import { validate } from '../../middleware/validate.js';
import {
  createYearSchema, updateYearSchema,
  createClassSchema, updateClassSchema,
  createSectionSchema, updateSectionSchema,
  createSubjectSchema, updateSubjectSchema,
  createEnrollmentSchema,
} from './academic.validation.js';

const router = Router();

/* Academic Years */
router.get('/years', authenticate, tenantGuard, authorize('admin'), AcademicController.listYears);
router.get('/years/:id', authenticate, tenantGuard, authorize('admin'), AcademicController.getYear);
router.post('/years', authenticate, tenantGuard, authorize('admin'), validate(createYearSchema), AcademicController.createYear);
router.patch('/years/:id', authenticate, tenantGuard, authorize('admin'), validate(updateYearSchema), AcademicController.updateYear);
router.delete('/years/:id', authenticate, tenantGuard, authorize('admin'), AcademicController.deleteYear);

/* Classes */
router.get('/classes', authenticate, tenantGuard, authorize('admin'), AcademicController.listClasses);
router.get('/classes/:id', authenticate, tenantGuard, authorize('admin'), AcademicController.getClass);
router.post('/classes', authenticate, tenantGuard, authorize('admin'), validate(createClassSchema), AcademicController.createClass);
router.patch('/classes/:id', authenticate, tenantGuard, authorize('admin'), validate(updateClassSchema), AcademicController.updateClass);
router.delete('/classes/:id', authenticate, tenantGuard, authorize('admin'), AcademicController.deleteClass);

/* Sections (nested under classes) */
router.get('/classes/:classId/sections', authenticate, tenantGuard, authorize('admin'), AcademicController.listSections);
router.post('/sections', authenticate, tenantGuard, authorize('admin'), validate(createSectionSchema), AcademicController.createSection);
router.patch('/sections/:id', authenticate, tenantGuard, authorize('admin'), validate(updateSectionSchema), AcademicController.updateSection);
router.delete('/sections/:id', authenticate, tenantGuard, authorize('admin'), AcademicController.deleteSection);

/* Subjects (nested under classes) */
router.get('/classes/:classId/subjects', authenticate, tenantGuard, authorize('admin'), AcademicController.listSubjects);
router.post('/subjects', authenticate, tenantGuard, authorize('admin'), validate(createSubjectSchema), AcademicController.createSubject);
router.patch('/subjects/:id', authenticate, tenantGuard, authorize('admin'), validate(updateSubjectSchema), AcademicController.updateSubject);
router.delete('/subjects/:id', authenticate, tenantGuard, authorize('admin'), AcademicController.deleteSubject);

/* Enrollments */
router.get('/enrollments', authenticate, tenantGuard, authorize('admin'), AcademicController.listEnrollments);
router.post('/enrollments', authenticate, tenantGuard, authorize('admin'), validate(createEnrollmentSchema), AcademicController.createEnrollment);
router.delete('/enrollments/:id', authenticate, tenantGuard, authorize('admin'), AcademicController.deleteEnrollment);

export const academicRoutes = router;
