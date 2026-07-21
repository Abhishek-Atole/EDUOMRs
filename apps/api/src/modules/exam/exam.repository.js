import { getPrisma } from '../../infrastructure/database/prisma.js';

export class ExamRepository {
  static async findAll(tenantId, page, limit, skip) {
    const prisma = getPrisma();
    const where = { tenantId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
        include: { class: { select: { name: true } }, subject: { select: { name: true } }, creator: { select: { firstName: true, lastName: true } }, _count: { select: { questions: true, examSessions: true } } },
      }),
      prisma.exam.count({ where }),
    ]);
    return { data, total };
  }

  static async findById(tenantId, id) {
    const prisma = getPrisma();
    return prisma.exam.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { class: true, subject: true, creator: { select: { firstName: true, lastName: true } }, _count: { select: { questions: true, examSessions: true } } },
    });
  }

  static async create(tenantId, data) {
    const prisma = getPrisma();
    return prisma.exam.create({ data: { ...data, tenantId } });
  }

  static async update(tenantId, id, data) {
    const prisma = getPrisma();
    return prisma.exam.update({ where: { id }, data });
  }

  static async softDelete(tenantId, id) {
    const prisma = getPrisma();
    return prisma.exam.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
