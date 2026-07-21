import { SubmissionService } from './submission.service.js';

export class SubmissionController {
  static async saveAnswer(req, res, next) {
    try {
      const result = await SubmissionService.saveAnswer(req.tenantId, req.params.sessionId, req.body.questionId, req.body.selectedOption, req.user.id);
      res.success(result, 200);
    } catch (err) { next(err); }
  }

  static async bulkSave(req, res, next) {
    try {
      const result = await SubmissionService.bulkSave(req.tenantId, req.params.sessionId, req.body.answers, req.user.id);
      res.success({ saved: result.length }, 200);
    } catch (err) { next(err); }
  }

  static async submit(req, res, next) {
    try {
      await SubmissionService.submit(req.tenantId, req.params.sessionId, req.user.id);
      res.success({ message: 'Exam submitted successfully' }, 200);
    } catch (err) { next(err); }
  }

  static async getSummary(req, res, next) {
    try {
      const summary = await SubmissionService.getSummary(req.tenantId, req.params.sessionId, req.user.id);
      res.success(summary, 200);
    } catch (err) { next(err); }
  }
}
