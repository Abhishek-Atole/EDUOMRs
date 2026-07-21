import { QuestionService } from './question.service.js';

export class QuestionController {
  static async list(req, res, next) {
    try { res.success(await QuestionService.listForExam(req.tenantId, req.params.examId), 200); }
    catch (err) { next(err); }
  }

  static async createMany(req, res, next) {
    try { res.success(await QuestionService.createMany(req.tenantId, req.params.examId, req.body.questions), 201); }
    catch (err) { next(err); }
  }

  static async update(req, res, next) {
    try { res.success(await QuestionService.update(req.tenantId, req.params.id, req.body), 200); }
    catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try { await QuestionService.delete(req.tenantId, req.params.id); res.success({ message: 'Question deleted' }, 200); }
    catch (err) { next(err); }
  }
}
