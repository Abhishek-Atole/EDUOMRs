import { SubscriptionService } from './subscription.service.js';
import { successResponse, createdResponse, paginatedResponse } from '../../utils/response.util.js';

export class SubscriptionController {
  static async listPlans(req, res, next) {
    try {
      const plans = await SubscriptionService.listPlans();
      return successResponse(req, res, plans);
    } catch (err) {
      next(err);
    }
  }

  static async getPlanById(req, res, next) {
    try {
      const plan = await SubscriptionService.getPlanById(req.params.id);
      return successResponse(req, res, plan);
    } catch (err) {
      next(err);
    }
  }

  static async createPlan(req, res, next) {
    try {
      const plan = await SubscriptionService.createPlan(req.body);
      return createdResponse(req, res, plan);
    } catch (err) {
      next(err);
    }
  }

  static async updatePlan(req, res, next) {
    try {
      const plan = await SubscriptionService.updatePlan(req.params.id, req.body);
      return successResponse(req, res, plan);
    } catch (err) {
      next(err);
    }
  }

  static async deletePlan(req, res, next) {
    try {
      const result = await SubscriptionService.deletePlan(req.params.id);
      return successResponse(req, res, result);
    } catch (err) {
      next(err);
    }
  }

  static async uploadPayment(req, res, next) {
    try {
      const payment = await SubscriptionService.createPayment(req.body, req.user.tenantId);
      return createdResponse(req, res, payment);
    } catch (err) {
      next(err);
    }
  }

  static async listPayments(req, res, next) {
    try {
      const result = await SubscriptionService.listPayments(req.query, req.user);
      return paginatedResponse(req, res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  static async verifyPayment(req, res, next) {
    try {
      const result = await SubscriptionService.verifyPayment(
        req.params.id,
        req.body.status,
        req.body.rejectionReason,
        req.user.id
      );
      return successResponse(req, res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getSubscription(req, res, next) {
    try {
      const sub = await SubscriptionService.getSubscription(req.user.tenantId);
      return successResponse(req, res, sub);
    } catch (err) {
      next(err);
    }
  }
}
