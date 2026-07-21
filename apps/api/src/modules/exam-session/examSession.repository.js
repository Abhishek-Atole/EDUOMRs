import { getPrisma } from '../../infrastructure/database/prisma.js';

export class ExamSessionRepository {
  static async findByExamAndStudent(tenantId, examId, studentId) {
    const prisma = getPrisma();
    return prisma.examSession.findUnique({
      where: { examId_studentId: { examId, studentId } },
    });
  }

  static async create(tenantId, examId, studentId) {
    const prisma = getPrisma();
    return prisma.examSession.create({
      data: { tenantId, examId, studentId },
    });
  }

  static async findById(tenantId, id) {
    const prisma = getPrisma();
    return prisma.examSession.findFirst({ where: { id, tenantId } });
  }

  static async update(tenantId, id, data) {
    const prisma = getPrisma();
    return prisma.examSession.update({ where: { id }, data });
  }

  static async findInProgressByExam(tenantId, examId) {
    const prisma = getPrisma();
    return prisma.examSession.findMany({
      where: { tenantId, examId, status: 'in_progress' },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });
  }
}
