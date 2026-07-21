import { getPrisma } from '../../infrastructure/database/prisma.js';

export class UserRepository {
  static async findById(id) {
    const prisma = getPrisma();
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, tenantId: true, createdAt: true },
    });
  }

  static async update(id, data) {
    const prisma = getPrisma();
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, tenantId: true, createdAt: true },
    });
  }

  static async findByIdWithPassword(id) {
    const prisma = getPrisma();
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, passwordHash: true },
    });
  }
}
