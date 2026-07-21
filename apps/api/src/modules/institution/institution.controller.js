import { InstitutionService } from './institution.service.js';
import { successResponse, paginatedResponse } from '../../utils/response.util.js';

export class InstitutionController {
  static async list(req, res, next) {
    try {
      const result = await InstitutionService.list(req.query);
      return paginatedResponse(req, res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const institution = await InstitutionService.getById(req.params.id);
      return successResponse(req, res, institution);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const institution = await InstitutionService.update(req.params.id, req.body, req.user);
      return successResponse(req, res, institution);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await InstitutionService.delete(req.params.id);
      return successResponse(req, res, result);
    } catch (err) {
      next(err);
    }
  }
}
