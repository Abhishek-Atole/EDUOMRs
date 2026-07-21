import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { TeacherRepository } from './teacher.repository.js';
import { ConflictError, NotFoundError } from '../../types/errors.js';

export class TeacherService {
  static async list(tenantId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return TeacherRepository.findAll(tenantId, page, limit, skip);
  }

  static async getById(tenantId, id) {
    const teacher = await TeacherRepository.findById(tenantId, id);
    if (!teacher) throw new NotFoundError('Teacher not found');
    return teacher;
  }

  static async create(tenantId, data) {
    const existing = await TeacherRepository.findByEmail(tenantId, data.email);
    if (existing) throw new ConflictError('A teacher with this email already exists');

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    return TeacherRepository.create(tenantId, {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName || null,
      phone: data.phone || null,
      isActive: true,
    });
  }

  static async update(tenantId, id, data) {
    const teacher = await TeacherRepository.findById(tenantId, id);
    if (!teacher) throw new NotFoundError('Teacher not found');

    return TeacherRepository.update(tenantId, id, data);
  }

  static async delete(tenantId, id) {
    const teacher = await TeacherRepository.findById(tenantId, id);
    if (!teacher) throw new NotFoundError('Teacher not found');

    await TeacherRepository.softDelete(tenantId, id);
  }
}
