import { getPrisma } from '../../infrastructure/database/prisma.js';

export class ParentRepository {
  static async findAll(tenantId, page, limit, skip) {
    const prisma = getPrisma();
    const where = { tenantId, role: 'parent', deletedAt: null };
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
      where: { id, tenantId, role: 'parent', deletedAt: null },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, isActive: true, createdAt: true },
    });
  }

  static async findByEmail(tenantId, email) {
    const prisma = getPrisma();
    return prisma.user.findFirst({
      where: { tenantId, email, role: 'parent', deletedAt: null },
    });
  }

  static async create(tenantId, data) {
    const prisma = getPrisma();
    return prisma.user.create({
      data: { ...data, tenantId, role: 'parent' },
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

  static async getLinkedStudents(tenantId, parentId) {
    const prisma = getPrisma();
    return prisma.parentStudent.findMany({
      where: { tenantId, parentId },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  static async linkStudent(tenantId, parentId, studentId) {
    const prisma = getPrisma();
    return prisma.parentStudent.create({
      data: { tenantId, parentId, studentId },
    });
  }

  static async unlinkStudent(tenantId, parentId, studentId) {
    const prisma = getPrisma();
    return prisma.parentStudent.deleteMany({
      where: { tenantId, parentId, studentId },
    });
  }

  static async findLink(tenantId, parentId, studentId) {
    const prisma = getPrisma();
    return prisma.parentStudent.findFirst({
      where: { tenantId, parentId, studentId },
    });
  }
}
