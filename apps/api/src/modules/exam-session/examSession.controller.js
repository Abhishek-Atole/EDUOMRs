import { ExamSessionService } from './examSession.service.js';

export class ExamSessionController {
  static async start(req, res, next) {
    try {
      const result = await ExamSessionService.start(req.tenantId, req.params.examId, req.user.id);
      res.success(result, 200);
    } catch (err) { next(err); }
  }

  static async getOmrData(req, res, next) {
    try {
      const data = await ExamSessionService.getOmrData(req.tenantId, req.params.examId, req.user.id);
      res.success(data, 200);
    } catch (err) { next(err); }
  }

  static async getActiveSessions(req, res, next) {
    try {
      const sessions = await ExamSessionService.getActiveSessions(req.tenantId, req.params.examId);
      res.success(sessions, 200);
    } catch (err) { next(err); }
  }
}
