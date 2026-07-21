import { AuthService } from './auth.service.js';
import { createdResponse, successResponse } from '../../utils/response.util.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return createdResponse(req, res, result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      return successResponse(req, res, result);
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req, res, next) {
    try {
      const result = await AuthService.refresh(req.body.refreshToken);
      return successResponse(req, res, result);
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      const result = await AuthService.logout(req.body.refreshToken);
      return successResponse(req, res, result);
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const result = await AuthService.forgotPassword(req.body);
      return successResponse(req, res, result);
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const result = await AuthService.resetPassword(req.body);
      return successResponse(req, res, result);
    } catch (err) {
      next(err);
    }
  }
}
