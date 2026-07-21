import { getPrisma } from '../../infrastructure/database/prisma.js';

export class StudentRepository {
  static async findAll(tenantId, page, limit, skip) {
    const prisma = getPrisma();
    const where = { tenantId, role: 'student', deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, isActive: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);
    return { data, total };
  }

  static async findById(tenantId, id) {
    const prisma = getPrisma();
    return prisma.user.findFirst({
      where: { id, tenantId, role: 'student', deletedAt: null },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, isActive: true, createdAt: true },
    });
  }

  static async findByEmail(tenantId, email) {
    const prisma = getPrisma();
    return prisma.user.findFirst({
      where: { tenantId, email, role: 'student', deletedAt: null },
    });
  }

  static async create(tenantId, data) {
    const prisma = getPrisma();
    return prisma.user.create({
      data: { ...data, tenantId, role: 'student' },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, isActive: true, createdAt: true },
    });
  }

  static async update(tenantId, id, data) {
    const prisma = getPrisma();
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, isActive: true, createdAt: true },
    });
  }

  static async softDelete(tenantId, id) {
    const prisma = getPrisma();
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
