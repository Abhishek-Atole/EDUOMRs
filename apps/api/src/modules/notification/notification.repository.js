import { getPrisma } from '../../infrastructure/database/prisma.js';

export class NotificationRepository {
  static async create(data) {
    const prisma = getPrisma();
    return prisma.notificationLog.create({ data });
  }

  static async update(id, data) {
    const prisma = getPrisma();
    return prisma.notificationLog.update({ where: { id }, data });
  }

  static async findPendingParentsByExam(tenantId, examId) {
    const prisma = getPrisma();
    const results = await prisma.result.findMany({
      where: { tenantId, examId, isReleased: true },
      include: {
        student: {
          include: {
            parentStudents: {
              include: { parent: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } } },
            },
          },
        },
        exam: { select: { title: true, totalMarks: true } },
      },
    });

    const notifications = [];
    for (const result of results) {
      for (const link of result.student.parentStudents) {
        const parent = link.parent;
        notifications.push({
          tenantId,
          parent,
          student: result.student,
          examTitle: result.exam.title,
          totalMarks: result.exam.totalMarks,
          score: result.totalScore,
          rank: result.rank,
          totalStudents: result.totalStudents,
        });
      }
    }
    return notifications;
  }
}
