import { UserService } from './user.service.js';

export class UserController {
  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getProfile(req.user.id);
      res.success(user, 200);
    } catch (err) { next(err); }
  }

  static async updateProfile(req, res, next) {
    try {
      const user = await UserService.updateProfile(req.user.id, req.body);
      res.success(user, 200);
    } catch (err) { next(err); }
  }

  static async changePassword(req, res, next) {
    try {
      const result = await UserService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
      return successResponse(req, res, result);
    } catch (err) {
      next(err);
    }
  }
}
