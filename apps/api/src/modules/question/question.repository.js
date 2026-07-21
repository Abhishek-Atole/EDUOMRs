import { getPrisma } from '../../infrastructure/database/prisma.js';

export class QuestionRepository {
  static async findByExam(tenantId, examId) {
    const prisma = getPrisma();
    return prisma.question.findMany({
      where: { examId, tenantId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  static async findById(tenantId, id) {
    const prisma = getPrisma();
    return prisma.question.findFirst({ where: { id, tenantId } });
  }

  static async createMany(tenantId, examId, questions) {
    const prisma = getPrisma();

    // Get current max orderIndex so appended questions don't collide
    const maxResult = await prisma.question.aggregate({
      where: { examId, tenantId },
      _max: { orderIndex: true },
    });
    const startIndex = (maxResult._max.orderIndex ?? 0) + 1;

    const data = questions.map((q, i) => ({
      tenantId,
      examId,
      questionText: q.questionText,
      options: q.options,
      correctOption: q.correctOption,
      marks: q.marks || 1,
      orderIndex: q.orderIndex ?? startIndex + i,
    }));

    await prisma.question.createMany({ data });
    return prisma.question.findMany({ where: { examId, tenantId }, orderBy: { orderIndex: 'asc' } });
  }

  static async update(tenantId, id, data) {
    const prisma = getPrisma();
    return prisma.question.update({ where: { id }, data });
  }

  static async delete(tenantId, id) {
    const prisma = getPrisma();
    return prisma.question.delete({ where: { id } });
  }

  static async deleteAllByExam(tenantId, examId) {
    const prisma = getPrisma();
    return prisma.question.deleteMany({ where: { examId, tenantId } });
  }
}
