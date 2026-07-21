import { getPrisma } from '../../infrastructure/database/prisma.js';

export class SubmissionRepository {
  static async upsertAnswer(tenantId, examSessionId, questionId, selectedOption) {
    const prisma = getPrisma();
    return prisma.studentAnswer.upsert({
      where: { examSessionId_questionId: { examSessionId, questionId } },
      update: { selectedOption, isSaved: true },
      create: { tenantId, examSessionId, questionId, selectedOption: selectedOption || null, isSaved: true },
    });
  }

  static async findAllAnswers(tenantId, examSessionId) {
    const prisma = getPrisma();
    return prisma.studentAnswer.findMany({ where: { examSessionId, tenantId } });
  }

  static async getAnsweredCount(tenantId, examSessionId) {
    const prisma = getPrisma();
    return prisma.studentAnswer.count({
      where: { examSessionId, tenantId, selectedOption: { not: null } },
    });
  }
}
