import { getPrisma } from '../../infrastructure/database/prisma.js';

export class AnswerKeyRepository {
  static async findByExam(tenantId, examId) {
    const prisma = getPrisma();
    return prisma.answerKey.findUnique({ where: { examId } });
  }

  static async upsert(tenantId, examId, entries, version = 1) {
    const prisma = getPrisma();
    return prisma.answerKey.upsert({
      where: { examId },
      update: { entries, version: { increment: 1 } },
      create: { tenantId, examId, entries, version },
    });
  }

  static async delete(tenantId, examId) {
    const prisma = getPrisma();
    return prisma.answerKey.delete({ where: { examId } });
  }
}
