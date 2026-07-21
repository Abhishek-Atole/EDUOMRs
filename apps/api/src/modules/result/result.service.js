import { ResultRepository } from './result.repository.js';
import { getPrisma } from '../../infrastructure/database/prisma.js';
import { NotFoundError, ForbiddenError } from '../../types/errors.js';
import { NotificationService } from '../notification/notification.service.js';
import { calculateAndStoreResult } from '../../utils/score.util.js';

export class ResultService {
  static async release(tenantId, examId) {
    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId, deletedAt: null } });
    if (!exam) throw new NotFoundError('Exam not found');

    const now = new Date();
    await prisma.result.updateMany({
      where: { examId, tenantId, isReleased: false },
      data: { isReleased: true, releasedAt: now },
    });

    await prisma.exam.update({
      where: { id: examId },
      data: { status: 'results_released' },
    });

    NotificationService.sendResultNotifications(tenantId, examId).catch(() => {});
  }

  static async getMyResult(tenantId, examId, studentId) {
    const result = await ResultRepository.findByExamAndStudent(tenantId, examId, studentId);
    if (!result) throw new NotFoundError('Result not found');
    if (!result.isReleased) throw new ForbiddenError('Result has not been released yet');

    return result;
  }

  static async getUserResult(tenantId, resultId) {
    const result = await ResultRepository.findById(tenantId, resultId);
    if (!result) throw new NotFoundError('Result not found');
    return result;
  }

  static async list(tenantId, examId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return ResultRepository.findByExam(tenantId, examId, page, limit, skip);
  }

  static async getLeaderboard(tenantId, examId) {
    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId, deletedAt: null } });
    if (!exam) throw new NotFoundError('Exam not found');

    return ResultRepository.getLeaderboard(tenantId, examId);
  }

  static async getAnalytics(tenantId, examId) {
    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId, deletedAt: null } });
    if (!exam) throw new NotFoundError('Exam not found');

    return ResultRepository.getAnalytics(tenantId, examId);
  }

  // EI-6: re-evaluate every submitted session for an exam after the answer key
  // is corrected. Re-scores against the current key and recomputes ranks.
  static async recalculate(tenantId, examId) {
    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId, deletedAt: null } });
    if (!exam) throw new NotFoundError('Exam not found');

    const sessions = await prisma.examSession.findMany({
      where: { examId, tenantId, submittedAt: { not: null } },
    });

    for (const session of sessions) {
      await calculateAndStoreResult(prisma, session, exam);
    }

    return { recalculated: sessions.length };
  }
}
