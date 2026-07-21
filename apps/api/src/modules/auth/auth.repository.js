import { getPrisma } from '../../infrastructure/database/prisma.js';

export class AuthRepository {
  static async createInstitutionAndAdmin({
    institutionName,
    adminEmail,
    passwordHash,
    adminFirstName,
    adminLastName,
    contactPhone,
  }) {
    const prisma = getPrisma();

    return prisma.$transaction(async (tx) => {
      // Create pending institution
      const institution = await tx.institution.create({
        data: {
          name: institutionName,
          status: 'pending',
          contactEmail: adminEmail,
          contactPhone,
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          tenantId: institution.id,
          email: adminEmail,
          passwordHash,
          firstName: adminFirstName,
          lastName: adminLastName,
          phone: contactPhone,
          role: 'admin',
          isActive: true,
        },
      });

      return { institution, user };
    });
  }

  static async findUserByEmail(email) {
    const prisma = getPrisma();
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        tenant: {
          select: { status: true },
        },
      },
    });
  }

  static async findUserById(id) {
    const prisma = getPrisma();
    return prisma.user.findUnique({
      where: { id },
      include: {
        tenant: {
          select: { status: true },
        },
      },
    });
  }

  static async createRefreshToken({ userId, tokenHash, expiresAt }) {
    const prisma = getPrisma();
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  static async findRefreshToken(tokenHash) {
    const prisma = getPrisma();
    return prisma.refreshToken.findFirst({
      where: { tokenHash },
    });
  }

  static async revokeRefreshToken(id) {
    const prisma = getPrisma();
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  static async revokeAllUserRefreshTokens(userId) {
    const prisma = getPrisma();
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  static async createPasswordResetToken({ userId, tokenHash, expiresAt }) {
    const prisma = getPrisma();
    // Invalidate any existing unused tokens first
    await prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
    return prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  static async findPasswordResetToken(tokenHash) {
    const prisma = getPrisma();
    return prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null },
      include: { user: { select: { id: true, email: true, isActive: true } } },
    });
  }

  static async markPasswordResetTokenUsed(id) {
    const prisma = getPrisma();
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  static async updateUserPassword(userId, passwordHash) {
    const prisma = getPrisma();
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash, updatedAt: new Date() },
    });
  }
}
