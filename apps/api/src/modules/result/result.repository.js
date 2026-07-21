import { getPrisma } from '../../infrastructure/database/prisma.js';

export class ResultRepository {
  static async findByExamAndStudent(tenantId, examId, studentId) {
    const prisma = getPrisma();
    return prisma.result.findFirst({
      where: { tenantId, examId, studentId },
      include: { questionResults: { include: { question: true } } },
    });
  }

  static async findByExam(tenantId, examId, page, limit, skip) {
    const prisma = getPrisma();
    const where = { tenantId, examId, isReleased: true };
    const [data, total] = await Promise.all([
      prisma.result.findMany({
        where,
        orderBy: { rank: 'asc' },
        skip, take: limit,
        include: { student: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      prisma.result.count({ where }),
    ]);
    return { data, total };
  }

  static async findById(tenantId, id) {
    const prisma = getPrisma();
    return prisma.result.findFirst({
      where: { id, tenantId },
      include: {
        student: { select: { firstName: true, lastName: true } },
        exam: { select: { title: true, totalMarks: true } },
        questionResults: {
          include: { question: { select: { questionText: true, options: true, orderIndex: true } } },
          orderBy: { question: { orderIndex: 'asc' } },
        },
      },
    });
  }

  static async getLeaderboard(tenantId, examId, limit = 10) {
    const prisma = getPrisma();
    return prisma.result.findMany({
      where: { tenantId, examId, isReleased: true },
      orderBy: { rank: 'asc' },
      take: limit,
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  static async getAnalytics(tenantId, examId) {
    const prisma = getPrisma();
    const where = { tenantId, examId, isReleased: true };

    const [totalStudents, results] = await Promise.all([
      prisma.result.count({ where }),
      prisma.result.findMany({ where, select: { percentage: true, totalScore: true, totalMarks: true, correctCount: true, wrongCount: true, skippedCount: true } }),
    ]);

    if (totalStudents === 0) return { totalStudents: 0 };

    const percentages = results.map((r) => Number(r.percentage));
    const scores = results.map((r) => Number(r.totalScore));
    const avgPercentage = percentages.reduce((a, b) => a + b, 0) / totalStudents;
    const passCount = results.filter((r) => Number(r.percentage) >= 40).length;

    const correctCounts = results.map((r) => r.correctCount);
    const wrongCounts = results.map((r) => r.wrongCount);
    const skippedCounts = results.map((r) => r.skippedCount);

    return {
      totalStudents,
      averagePercentage: Math.round(avgPercentage * 100) / 100,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passCount,
      passPercentage: Math.round((passCount / totalStudents) * 10000) / 100,
      totalCorrect: correctCounts.reduce((a, b) => a + b, 0),
      totalWrong: wrongCounts.reduce((a, b) => a + b, 0),
      totalSkipped: skippedCounts.reduce((a, b) => a + b, 0),
    };
  }
}
