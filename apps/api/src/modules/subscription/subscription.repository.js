import { getPrisma } from '../../infrastructure/database/prisma.js';

export class SubscriptionRepository {
  static async findAllPlans(onlyActive = true) {
    const prisma = getPrisma();
    const where = onlyActive ? { isActive: true } : {};
    return prisma.subscriptionPlan.findMany({ where, orderBy: { price: 'asc' } });
  }

  static async findPlanById(id) {
    const prisma = getPrisma();
    return prisma.subscriptionPlan.findUnique({ where: { id } });
  }

  static async createPlan(data) {
    const prisma = getPrisma();
    return prisma.subscriptionPlan.create({ data });
  }

  static async updatePlan(id, data) {
    const prisma = getPrisma();
    return prisma.subscriptionPlan.update({ where: { id }, data });
  }

  static async deletePlan(id) {
    const prisma = getPrisma();
    return prisma.subscriptionPlan.update({ where: { id }, data: { isActive: false } });
  }

  // Payments
  static async createPayment(data) {
    const prisma = getPrisma();
    return prisma.paymentUpload.create({ data });
  }

  static async findPaymentsByTenant(tenantId, page, limit, skip) {
    const prisma = getPrisma();
    const where = { tenantId };
    const [data, total] = await Promise.all([
      prisma.paymentUpload.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.paymentUpload.count({ where }),
    ]);
    return { data, total };
  }

  static async findAllPayments(page, limit, skip) {
    const prisma = getPrisma();
    const [data, total] = await Promise.all([
      prisma.paymentUpload.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { tenant: { select: { name: true } } },
      }),
      prisma.paymentUpload.count(),
    ]);
    return { data, total };
  }

  static async findPaymentById(id) {
    const prisma = getPrisma();
    return prisma.paymentUpload.findUnique({ where: { id } });
  }

  static async verifyPayment(id, verifiedById, status, rejectionReason) {
    const prisma = getPrisma();
    return prisma.paymentUpload.update({
      where: { id },
      data: { status, verifiedById, rejectionReason: rejectionReason || null },
    });
  }

  // Subscriptions
  static async findActiveSubscription(tenantId) {
    const prisma = getPrisma();
    return prisma.subscription.findFirst({
      where: { tenantId, status: 'active', endDate: { gte: new Date() } },
      orderBy: { endDate: 'desc' },
      include: { plan: true },
    });
  }

  static async createSubscription(data) {
    const prisma = getPrisma();
    return prisma.subscription.create({ data });
  }
}
