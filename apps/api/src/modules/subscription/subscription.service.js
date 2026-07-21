import { SubscriptionRepository } from './subscription.repository.js';
import { NotFoundError, ConflictError } from '../../types/errors.js';
import { getPaginationParams, formatPaginationMeta } from '../../utils/pagination.util.js';
import { delCache } from '../../infrastructure/cache/redis.js';

export class SubscriptionService {
  static async listPlans() {
    return SubscriptionRepository.findAllPlans(true);
  }

  static async getPlanById(id) {
    const plan = await SubscriptionRepository.findPlanById(id);
    if (!plan) throw new NotFoundError('Subscription plan');
    return plan;
  }

  static async createPlan(data) {
    return SubscriptionRepository.createPlan(data);
  }

  static async updatePlan(id, data) {
    const plan = await SubscriptionRepository.findPlanById(id);
    if (!plan) throw new NotFoundError('Subscription plan');
    return SubscriptionRepository.updatePlan(id, data);
  }

  static async deletePlan(id) {
    const plan = await SubscriptionRepository.findPlanById(id);
    if (!plan) throw new NotFoundError('Subscription plan');
    return SubscriptionRepository.deletePlan(id);
  }

  static async createPayment(data, tenantId) {
    return SubscriptionRepository.createPayment({
      tenantId,
      planId: data.planId,
      utrNumber: data.utrNumber,
      amount: data.amount,
      screenshotUrl: data.screenshotUrl,
      status: 'pending',
    });
  }

  static async listPayments(query, user) {
    const { page, limit, skip } = getPaginationParams(query);
    let result;
    if (user.role === 'super_admin') {
      result = await SubscriptionRepository.findAllPayments(page, limit, skip);
    } else {
      result = await SubscriptionRepository.findPaymentsByTenant(user.tenantId, page, limit, skip);
    }
    return { data: result.data, pagination: formatPaginationMeta(result.total, page, limit) };
  }

  static async verifyPayment(id, status, rejectionReason, verifiedById) {
    const payment = await SubscriptionRepository.findPaymentById(id);
    if (!payment) throw new NotFoundError('Payment');
    if (payment.status !== 'pending') {
      throw new ConflictError('Payment is already ' + payment.status);
    }

    const result = await SubscriptionRepository.verifyPayment(id, verifiedById, status, rejectionReason);

    if (status === 'verified') {
      const plan = await SubscriptionRepository.findPlanById(payment.planId);
      if (!plan) throw new NotFoundError('Subscription plan');

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationDays);

      // Update institution status to active
      const { getPrisma } = await import('../../infrastructure/database/prisma.js');
      const prisma = getPrisma();
      await prisma.institution.update({
        where: { id: payment.tenantId },
        data: { status: 'active' },
      });

      await SubscriptionRepository.createSubscription({
        tenantId: payment.tenantId,
        planId: payment.planId,
        startDate,
        endDate,
        status: 'active',
      });

      await delCache(`sub:active:${payment.tenantId}`);
    }

    return result;
  }

  static async getSubscription(tenantId) {
    const sub = await SubscriptionRepository.findActiveSubscription(tenantId);
    if (!sub) {
      return { status: 'inactive', message: 'No active subscription found' };
    }
    return sub;
  }
}
