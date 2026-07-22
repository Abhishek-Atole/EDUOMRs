import { SubmissionRepository } from './submission.repository.js';
import { ExamSessionRepository } from '../exam-session/examSession.repository.js';
import { getPrisma } from '../../infrastructure/database/prisma.js';
import { NotFoundError, ForbiddenError, ExamExpiredError } from '../../types/errors.js';
import { calculateAndStoreResult } from '../../utils/score.util.js';

export class SubmissionService {
  static async saveAnswer(tenantId, examSessionId, questionId, selectedOption, userId) {
    const session = await ExamSessionRepository.findById(tenantId, examSessionId);
    if (!session) throw new NotFoundError('Exam session not found');
    if (session.studentId !== userId) throw new ForbiddenError('Not your exam session');
    if (session.status !== 'in_progress') throw new ForbiddenError('Exam session is not active');

    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: session.examId, tenantId } });
    if (exam.deadlineAt && new Date() > exam.deadlineAt) {
      await ExamSessionRepository.update(tenantId, examSessionId, { status: 'expired' });
      throw new ExamExpiredError('Exam deadline has passed');
    }

    return SubmissionRepository.upsertAnswer(tenantId, examSessionId, questionId, selectedOption);
  }

  static async bulkSave(tenantId, examSessionId, answers, userId) {
    const session = await ExamSessionRepository.findById(tenantId, examSessionId);
    if (!session) throw new NotFoundError('Exam session not found');
    if (session.studentId !== userId) throw new ForbiddenError('Not your exam session');
    if (session.status !== 'in_progress') throw new ForbiddenError('Exam session is not active');

    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: session.examId, tenantId } });
    if (exam.deadlineAt && new Date() > exam.deadlineAt) {
      await ExamSessionRepository.update(tenantId, examSessionId, { status: 'expired' });
      throw new ExamExpiredError('Exam deadline has passed');
    }

    const results = [];
    for (const answer of answers) {
      const saved = await SubmissionRepository.upsertAnswer(tenantId, examSessionId, answer.questionId, answer.selectedOption);
      results.push(saved);
    }
    return results;
  }

  static async submit(tenantId, examSessionId, userId) {
    const session = await ExamSessionRepository.findById(tenantId, examSessionId);
    if (!session) throw new NotFoundError('Exam session not found');
    if (session.studentId !== userId) throw new ForbiddenError('Not your exam session');
    if (session.status !== 'in_progress') throw new ForbiddenError('Exam session is not active');

    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: session.examId, tenantId } });
    if (!exam) throw new NotFoundError('Exam not found');

    if (exam.deadlineAt && new Date() > exam.deadlineAt) {
      await ExamSessionRepository.update(tenantId, examSessionId, { status: 'expired' });
      throw new ExamExpiredError('Exam deadline has passed');
    }

    // Also reject if the student started more than durationMinutes ago (EI-3).
    if (exam.durationMinutes) {
      const durationMs = exam.durationMinutes * 60 * 1000;
      if (Date.now() - new Date(session.startedAt).getTime() > durationMs) {
        await ExamSessionRepository.update(tenantId, examSessionId, { status: 'expired' });
        throw new ExamExpiredError('Exam time limit has been exceeded');
      }
    }

    await ExamSessionRepository.update(tenantId, examSessionId, {
      status: 'submitted',
      submittedAt: new Date(),
    });

    await calculateAndStoreResult(prisma, { ...session, status: 'submitted' }, exam);
  }

  static async getSummary(tenantId, examSessionId, userId) {
    const session = await ExamSessionRepository.findById(tenantId, examSessionId);
    if (!session) throw new NotFoundError('Exam session not found');
    if (session.studentId !== userId) throw new ForbiddenError('Not your exam session');

    const answered = await SubmissionRepository.getAnsweredCount(tenantId, examSessionId);
    const total = await (async () => {
      const prisma = getPrisma();
      return prisma.question.count({ where: { examId: session.examId, tenantId } });
    })();

    return {
      answered,
      skipped: total - answered,
      total,
      status: session.status,
    };
  }
}
