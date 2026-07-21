import { QuestionRepository } from './question.repository.js';
import { getPrisma } from '../../infrastructure/database/prisma.js';
import { NotFoundError, ValidationError } from '../../types/errors.js';

export class QuestionService {
  static async listForExam(tenantId, examId) {
    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId, deletedAt: null } });
    if (!exam) throw new NotFoundError('Exam not found');

    return QuestionRepository.findByExam(tenantId, examId);
  }

  static async listForExamStudent(tenantId, examId) {
    const questions = await QuestionService.listForExam(tenantId, examId);
    return questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      marks: q.marks,
      orderIndex: q.orderIndex,
    }));
  }

  static async createMany(tenantId, examId, questions) {
    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId, deletedAt: null } });
    if (!exam) throw new NotFoundError('Exam not found');
    if (exam.status !== 'draft') throw new ValidationError('Cannot modify questions on a published exam');

    return QuestionRepository.createMany(tenantId, examId, questions);
  }

  static async update(tenantId, questionId, data) {
    const question = await QuestionRepository.findById(tenantId, questionId);
    if (!question) throw new NotFoundError('Question not found');

    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: question.examId, tenantId, deletedAt: null } });
    if (exam.status !== 'draft') throw new ValidationError('Cannot modify questions on a published exam');

    return QuestionRepository.update(tenantId, questionId, data);
  }

  static async delete(tenantId, questionId) {
    const question = await QuestionRepository.findById(tenantId, questionId);
    if (!question) throw new NotFoundError('Question not found');

    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: question.examId, tenantId, deletedAt: null } });
    if (exam.status !== 'draft') throw new ValidationError('Cannot modify questions on a published exam');

    await QuestionRepository.delete(tenantId, questionId);
  }
}
