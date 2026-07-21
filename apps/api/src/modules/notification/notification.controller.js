import { NotificationService } from './notification.service.js';

export class NotificationController {
  static async sendResults(req, res, next) {
    try {
      const result = await NotificationService.sendResultNotifications(req.tenantId, req.params.examId);
      res.success(result, 200);
    } catch (err) { next(err); }
  }
}
