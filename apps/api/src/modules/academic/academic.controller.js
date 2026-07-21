import { AcademicService } from './academic.service.js';

export class AcademicController {
  /* ── Years ── */
  static async listYears(req, res, next) {
    try {
      const { page, limit } = req.query;
      const r = await AcademicService.listYears(req.tenantId, Number(page) || 1, Number(limit) || 10);
      res.status(200).json(res.paginated(r.data, r.total, Number(page) || 1, Number(limit) || 10));
    } catch (err) { next(err); }
  }

  static async getYear(req, res, next) {
    try { res.success(await AcademicService.getYear(req.tenantId, req.params.id), 200); }
    catch (err) { next(err); }
  }

  static async createYear(req, res, next) {
    try { res.success(await AcademicService.createYear(req.tenantId, req.body), 201); }
    catch (err) { next(err); }
  }

  static async updateYear(req, res, next) {
    try { res.success(await AcademicService.updateYear(req.tenantId, req.params.id, req.body), 200); }
    catch (err) { next(err); }
  }

  static async deleteYear(req, res, next) {
    try { await AcademicService.deleteYear(req.tenantId, req.params.id); res.success({ message: 'Deleted' }, 200); }
    catch (err) { next(err); }
  }

  /* ── Classes ── */
  static async listClasses(req, res, next) {
    try {
      const { page, limit } = req.query;
      const r = await AcademicService.listClasses(req.tenantId, Number(page) || 1, Number(limit) || 10);
      res.status(200).json(res.paginated(r.data, r.total, Number(page) || 1, Number(limit) || 10));
    } catch (err) { next(err); }
  }

  static async getClass(req, res, next) {
    try { res.success(await AcademicService.getClass(req.tenantId, req.params.id), 200); }
    catch (err) { next(err); }
  }

  static async createClass(req, res, next) {
    try { res.success(await AcademicService.createClass(req.tenantId, req.body), 201); }
    catch (err) { next(err); }
  }

  static async updateClass(req, res, next) {
    try { res.success(await AcademicService.updateClass(req.tenantId, req.params.id, req.body), 200); }
    catch (err) { next(err); }
  }

  static async deleteClass(req, res, next) {
    try { await AcademicService.deleteClass(req.tenantId, req.params.id); res.success({ message: 'Deleted' }, 200); }
    catch (err) { next(err); }
  }

  /* ── Sections ── */
  static async listSections(req, res, next) {
    try { res.success(await AcademicService.listSections(req.tenantId, req.params.classId), 200); }
    catch (err) { next(err); }
  }

  static async createSection(req, res, next) {
    try { res.success(await AcademicService.createSection(req.tenantId, req.body), 201); }
    catch (err) { next(err); }
  }

  static async updateSection(req, res, next) {
    try { res.success(await AcademicService.updateSection(req.tenantId, req.params.id, req.body), 200); }
    catch (err) { next(err); }
  }

  static async deleteSection(req, res, next) {
    try { await AcademicService.deleteSection(req.tenantId, req.params.id); res.success({ message: 'Deleted' }, 200); }
    catch (err) { next(err); }
  }

  /* ── Subjects ── */
  static async listSubjects(req, res, next) {
    try { res.success(await AcademicService.listSubjects(req.tenantId, req.params.classId), 200); }
    catch (err) { next(err); }
  }

  static async createSubject(req, res, next) {
    try { res.success(await AcademicService.createSubject(req.tenantId, req.body), 201); }
    catch (err) { next(err); }
  }

  static async updateSubject(req, res, next) {
    try { res.success(await AcademicService.updateSubject(req.tenantId, req.params.id, req.body), 200); }
    catch (err) { next(err); }
  }

  static async deleteSubject(req, res, next) {
    try { await AcademicService.deleteSubject(req.tenantId, req.params.id); res.success({ message: 'Deleted' }, 200); }
    catch (err) { next(err); }
  }

  /* ── Enrollments ── */
  static async listEnrollments(req, res, next) {
    try {
      const { page, limit } = req.query;
      const r = await AcademicService.listEnrollments(req.tenantId, Number(page) || 1, Number(limit) || 10);
      res.status(200).json(res.paginated(r.data, r.total, Number(page) || 1, Number(limit) || 10));
    } catch (err) { next(err); }
  }

  static async createEnrollment(req, res, next) {
    try { res.success(await AcademicService.createEnrollment(req.tenantId, req.body), 201); }
    catch (err) { next(err); }
  }

  static async deleteEnrollment(req, res, next) {
    try { await AcademicService.deleteEnrollment(req.tenantId, req.params.id); res.success({ message: 'Deleted' }, 200); }
    catch (err) { next(err); }
  }
}
