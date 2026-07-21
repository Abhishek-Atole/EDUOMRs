import { AnswerKeyService } from './answerKey.service.js';

export class AnswerKeyController {
  static async get(req, res, next) {
    try { res.success(await AnswerKeyService.get(req.tenantId, req.params.examId), 200); }
    catch (err) { next(err); }
  }

  static async upload(req, res, next) {
    try { res.success(await AnswerKeyService.upload(req.tenantId, req.params.examId, req.body.entries), 200); }
    catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try { await AnswerKeyService.delete(req.tenantId, req.params.examId); res.success({ message: 'Answer key deleted' }, 200); }
    catch (err) { next(err); }
  }
}
