import { ExamService } from './exam.service.js';
import { generateQuestionPaperPdf } from './exam.pdf.js';

export class ExamController {
  static async list(req, res, next) {
    try {
      const { page, limit } = req.query;
      const r = await ExamService.list(req.tenantId, Number(page) || 1, Number(limit) || 10);
      res.status(200).json(res.paginated(r.data, r.total, Number(page) || 1, Number(limit) || 10));
    } catch (err) { next(err); }
  }

  static async getById(req, res, next) {
    try { res.success(await ExamService.getById(req.tenantId, req.params.id), 200); }
    catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try { res.success(await ExamService.create(req.tenantId, req.body, req.user.id), 201); }
    catch (err) { next(err); }
  }

  static async update(req, res, next) {
    try { res.success(await ExamService.update(req.tenantId, req.params.id, req.body), 200); }
    catch (err) { next(err); }
  }

  static async delete(req, res, next) {
    try { await ExamService.delete(req.tenantId, req.params.id); res.success({ message: 'Exam deleted' }, 200); }
    catch (err) { next(err); }
  }

  static async publish(req, res, next) {
    try { res.success(await ExamService.publish(req.tenantId, req.params.id, req.body), 200); }
    catch (err) { next(err); }
  }

  static async downloadPdf(req, res, next) {
    try {
      const pdf = await generateQuestionPaperPdf(req.tenantId, req.params.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="question-paper-${req.params.id}.pdf"`);
      res.send(pdf);
    } catch (err) { next(err); }
  }
}
