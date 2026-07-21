import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { StudentRepository } from './student.repository.js';
import { ConflictError, NotFoundError } from '../../types/errors.js';

export class StudentService {
  static async list(tenantId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return StudentRepository.findAll(tenantId, page, limit, skip);
  }

  static async getById(tenantId, id) {
    const student = await StudentRepository.findById(tenantId, id);
    if (!student) throw new NotFoundError('Student not found');
    return student;
  }

  static async create(tenantId, data) {
    const existing = await StudentRepository.findByEmail(tenantId, data.email);
    if (existing) throw new ConflictError('A student with this email already exists');

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    return StudentRepository.create(tenantId, {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName || null,
      phone: data.phone || null,
      isActive: true,
    });
  }

  static async update(tenantId, id, data) {
    const student = await StudentRepository.findById(tenantId, id);
    if (!student) throw new NotFoundError('Student not found');

    return StudentRepository.update(tenantId, id, data);
  }

  static async delete(tenantId, id) {
    const student = await StudentRepository.findById(tenantId, id);
    if (!student) throw new NotFoundError('Student not found');

    await StudentRepository.softDelete(tenantId, id);
  }
}
