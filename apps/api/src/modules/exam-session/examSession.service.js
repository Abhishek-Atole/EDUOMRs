import { ExamSessionRepository } from './examSession.repository.js';
import { QuestionRepository } from '../question/question.repository.js';
import { getPrisma } from '../../infrastructure/database/prisma.js';
import { NotFoundError, ForbiddenError, ExamExpiredError } from '../../types/errors.js';

export class ExamSessionService {
  static async start(tenantId, examId, studentId) {
    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId, deletedAt: null } });
    if (!exam) throw new NotFoundError('Exam not found');

    if (exam.status === 'draft') throw new ForbiddenError('Exam is not yet published');
    if (exam.status === 'completed') throw new ForbiddenError('Exam has already ended');

    if (exam.deadlineAt && new Date() > exam.deadlineAt) {
      throw new ExamExpiredError('Exam deadline has passed');
    }

    const existing = await ExamSessionRepository.findByExamAndStudent(tenantId, examId, studentId);
    if (existing) {
      if (existing.status !== 'in_progress') throw new ForbiddenError('You have already submitted this exam');
      return { session: existing, exam, isNew: false };
    }

    const session = await ExamSessionRepository.create(tenantId, examId, studentId);

    let questions = null;
    if (exam.examMode === 'DIGITAL') {
      const prisma = getPrisma();
      const rawQuestions = await prisma.question.findMany({
        where: { examId, tenantId },
        orderBy: { orderIndex: 'asc' },
        select: { id: true, questionText: true, options: true, marks: true, orderIndex: true },
      });
      questions = rawQuestions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options,
        marks: q.marks,
        orderIndex: q.orderIndex,
      }));
    }

    return { session, exam, questions, isNew: true };
  }

  static async getOmrData(tenantId, examId, studentId) {
    const session = await ExamSessionRepository.findByExamAndStudent(tenantId, examId, studentId);
    if (!session) throw new NotFoundError('Exam session not found. Start the exam first.');

    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId, deletedAt: null },
      select: { id: true, title: true, examMode: true, durationMinutes: true, scheduledAt: true, deadlineAt: true, status: true, marksPerCorrect: true, marksPerWrong: true, negativeMarking: true, totalMarks: true },
    });
    if (!exam) throw new NotFoundError('Exam not found');

    const existingAnswers = await prisma.studentAnswer.findMany({
      where: { examSessionId: session.id },
      select: { questionId: true, selectedOption: true },
    });

    const answerMap = {};
    for (const a of existingAnswers) {
      answerMap[a.questionId] = a.selectedOption;
    }

    let questions = null;
    let totalQuestions = 0;

    if (exam.examMode === 'DIGITAL') {
      const rawQuestions = await QuestionRepository.findByExam(tenantId, examId);
      questions = rawQuestions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options,
        marks: q.marks,
        orderIndex: q.orderIndex,
      }));
      totalQuestions = rawQuestions.length;
    } else {
      totalQuestions = await prisma.question.count({ where: { examId, tenantId } });
    }

    return {
      session: { id: session.id, status: session.status, startedAt: session.startedAt },
      exam,
      questions,
      answers: answerMap,
      totalQuestions,
    };
  }

  static async getActiveSessions(tenantId, examId) {
    return ExamSessionRepository.findInProgressByExam(tenantId, examId);
  }
}
