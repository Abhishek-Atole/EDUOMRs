import { TeacherService } from './teacher.service.js';

export class TeacherController {
  static async list(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await TeacherService.list(req.tenantId, Number(page) || 1, Number(limit) || 10);
      res.status(200).json(res.paginated(result.data, result.total, Number(page) || 1, Number(limit) || 10));
    } catch (err) { next(err); }
  }

  static async getById(req, res, next) {
    try {
      const teacher = await TeacherService.getById(req.tenantId, req.params.id);
      res.success(teacher, 200);
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const teacher = await TeacherService.create(req.tenantId, req.body);
      res.success(teacher, 201);
    } catch (err) { next(err); }
  }

  static async update(req, res, next) {
    try {
      const teacher = await TeacherService.update(req.tenantId, req.params.id, req.body);
      res.success(teacher, 200);
    } catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try {
      await TeacherService.delete(req.tenantId, req.params.id);
      res.success({ message: 'Teacher deleted successfully' }, 200);
    } catch (err) { next(err); }
  }
}
