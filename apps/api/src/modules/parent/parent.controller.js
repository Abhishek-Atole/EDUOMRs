import { ParentService } from './parent.service.js';

export class ParentController {
  static async list(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await ParentService.list(req.tenantId, Number(page) || 1, Number(limit) || 10);
      res.status(200).json(res.paginated(result.data, result.total, Number(page) || 1, Number(limit) || 10));
    } catch (err) { next(err); }
  }

  static async getById(req, res, next) {
    try {
      const parent = await ParentService.getById(req.tenantId, req.params.id);
      res.success(parent, 200);
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const parent = await ParentService.create(req.tenantId, req.body);
      res.success(parent, 201);
    } catch (err) { next(err); }
  }

  static async update(req, res, next) {
    try {
      const parent = await ParentService.update(req.tenantId, req.params.id, req.body);
      res.success(parent, 200);
    } catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try {
      await ParentService.delete(req.tenantId, req.params.id);
      res.success({ message: 'Parent deleted successfully' }, 200);
    } catch (err) { next(err); }
  }

  static async getChildren(req, res, next) {
    try {
      const children = await ParentService.getChildren(req.tenantId, req.params.id);
      res.success(children, 200);
    } catch (err) { next(err); }
  }

  static async linkStudent(req, res, next) {
    try {
      await ParentService.linkStudent(req.tenantId, req.params.id, req.body.studentId);
      res.success({ message: 'Student linked successfully' }, 200);
    } catch (err) { next(err); }
  }

  static async unlinkStudent(req, res, next) {
    try {
      await ParentService.unlinkStudent(req.tenantId, req.params.id, req.params.studentId);
      res.success({ message: 'Student unlinked successfully' }, 200);
    } catch (err) { next(err); }
  }
}
