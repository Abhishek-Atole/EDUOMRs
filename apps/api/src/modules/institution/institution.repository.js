import { getPrisma } from '../../infrastructure/database/prisma.js';

export class InstitutionRepository {
  static async findAll(page, limit, skip) {
    const prisma = getPrisma();
    const where = { deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.institution.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.institution.count({ where }),
    ]);
    return { data, total };
  }

  static async findById(id) {
    const prisma = getPrisma();
    return prisma.institution.findFirst({
      where: { id, deletedAt: null },
    });
  }

  static async update(id, data) {
    const prisma = getPrisma();
    return prisma.institution.update({
      where: { id },
      data,
    });
  }

  static async softDelete(id) {
    const prisma = getPrisma();
    return prisma.institution.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
