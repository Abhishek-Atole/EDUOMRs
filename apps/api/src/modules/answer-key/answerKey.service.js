import { AnswerKeyRepository } from './answerKey.repository.js';
import { getPrisma } from '../../infrastructure/database/prisma.js';
import { NotFoundError } from '../../types/errors.js';

export class AnswerKeyService {
  static async get(tenantId, examId) {
    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId, deletedAt: null } });
    if (!exam) throw new NotFoundError('Exam not found');

    const key = await AnswerKeyRepository.findByExam(tenantId, examId);
    if (!key) throw new NotFoundError('Answer key not found');
    return key;
  }

  static async upload(tenantId, examId, entries) {
    const prisma = getPrisma();
    const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId, deletedAt: null } });
    if (!exam) throw new NotFoundError('Exam not found');

    return AnswerKeyRepository.upsert(tenantId, examId, entries);
  }

  static async delete(tenantId, examId) {
    const key = await AnswerKeyRepository.findByExam(tenantId, examId);
    if (!key) throw new NotFoundError('Answer key not found');

    await AnswerKeyRepository.delete(tenantId, examId);
  }
}
