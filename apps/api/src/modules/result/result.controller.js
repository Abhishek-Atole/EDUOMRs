import { ResultService } from './result.service.js';

export class ResultController {
  static async release(req, res, next) {
    try {
      await ResultService.release(req.tenantId, req.params.examId);
      res.success({ message: 'Results released' }, 200);
    } catch (err) { next(err); }
  }

  static async getMyResult(req, res, next) {
    try {
      const result = await ResultService.getMyResult(req.tenantId, req.params.examId, req.user.id);
      res.success(result, 200);
    } catch (err) { next(err); }
  }

  static async getUserResult(req, res, next) {
    try {
      const result = await ResultService.getUserResult(req.tenantId, req.params.id, req.user.id);
      res.success(result, 200);
    } catch (err) { next(err); }
  }

  static async list(req, res, next) {
    try {
      const { page, limit } = req.query;
      const r = await ResultService.list(req.tenantId, req.params.examId, Number(page) || 1, Number(limit) || 10);
      res.status(200).json(res.paginated(r.data, r.total, Number(page) || 1, Number(limit) || 10));
    } catch (err) { next(err); }
  }

  static async leaderboard(req, res, next) {
    try {
      const board = await ResultService.getLeaderboard(req.tenantId, req.params.examId);
      res.success(board, 200);
    } catch (err) { next(err); }
  }

  static async analytics(req, res, next) {
    try {
      const analytics = await ResultService.getAnalytics(req.tenantId, req.params.examId);
      res.success(analytics, 200);
    } catch (err) { next(err); }
  }

  static async recalculate(req, res, next) {
    try {
      const result = await ResultService.recalculate(req.tenantId, req.params.examId);
      res.success(result, 200);
    } catch (err) { next(err); }
  }
}
