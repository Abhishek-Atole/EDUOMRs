import { InstitutionRepository } from './institution.repository.js';
import { NotFoundError } from '../../types/errors.js';
import { getPaginationParams, formatPaginationMeta } from '../../utils/pagination.util.js';

export class InstitutionService {
  static async list(query) {
    const { page, limit, skip } = getPaginationParams(query);
    const { data, total } = await InstitutionRepository.findAll(page, limit, skip);
    return { data, pagination: formatPaginationMeta(total, page, limit) };
  }

  static async getById(id) {
    const institution = await InstitutionRepository.findById(id);
    if (!institution) throw new NotFoundError('Institution');
    return institution;
  }

  static async update(id, data, requestingUser) {
    const institution = await InstitutionRepository.findById(id);
    if (!institution) throw new NotFoundError('Institution');

    const allowed = {};
    if (data.name !== undefined) allowed.name = data.name;
    if (data.address !== undefined) allowed.address = data.address;
    if (data.contactEmail !== undefined) allowed.contactEmail = data.contactEmail;
    if (data.contactPhone !== undefined) allowed.contactPhone = data.contactPhone;
    if (data.status !== undefined && requestingUser.role === 'super_admin') allowed.status = data.status;

    return InstitutionRepository.update(id, allowed);
  }

  static async delete(id) {
    const institution = await InstitutionRepository.findById(id);
    if (!institution) throw new NotFoundError('Institution');
    await InstitutionRepository.softDelete(id);
    return { message: 'Institution deleted successfully' };
  }
}
