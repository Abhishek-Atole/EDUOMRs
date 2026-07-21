import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';
import { ParentRepository } from './parent.repository.js';
import { getPrisma } from '../../infrastructure/database/prisma.js';
import { ConflictError, NotFoundError } from '../../types/errors.js';

export class ParentService {
  static async list(tenantId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return ParentRepository.findAll(tenantId, page, limit, skip);
  }

  static async getById(tenantId, id) {
    const parent = await ParentRepository.findById(tenantId, id);
    if (!parent) throw new NotFoundError('Parent not found');
    return parent;
  }

  static async create(tenantId, data) {
    const existing = await ParentRepository.findByEmail(tenantId, data.email);
    if (existing) throw new ConflictError('A parent with this email already exists');

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    return ParentRepository.create(tenantId, {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName || null,
      phone: data.phone || null,
      isActive: true,
    });
  }

  static async update(tenantId, id, data) {
    const parent = await ParentRepository.findById(tenantId, id);
    if (!parent) throw new NotFoundError('Parent not found');

    return ParentRepository.update(tenantId, id, data);
  }

  static async delete(tenantId, id) {
    const parent = await ParentRepository.findById(tenantId, id);
    if (!parent) throw new NotFoundError('Parent not found');

    await ParentRepository.softDelete(tenantId, id);
  }

  static async getChildren(tenantId, parentId) {
    const parent = await ParentRepository.findById(tenantId, parentId);
    if (!parent) throw new NotFoundError('Parent not found');

    const links = await ParentRepository.getLinkedStudents(tenantId, parentId);
    return links.map(l => l.student);
  }

  static async linkStudent(tenantId, parentId, studentId) {
    const parent = await ParentRepository.findById(tenantId, parentId);
    if (!parent) throw new NotFoundError('Parent not found');

    const prisma = getPrisma();
    const student = await prisma.user.findFirst({
      where: { id: studentId, tenantId, role: 'student', deletedAt: null },
    });
    if (!student) throw new NotFoundError('Student not found');

    const existingLink = await ParentRepository.findLink(tenantId, parentId, studentId);
    if (existingLink) throw new ConflictError('Parent already linked to this student');

    await ParentRepository.linkStudent(tenantId, parentId, studentId);
  }

  static async unlinkStudent(tenantId, parentId, studentId) {
    const parent = await ParentRepository.findById(tenantId, parentId);
    if (!parent) throw new NotFoundError('Parent not found');

    const existingLink = await ParentRepository.findLink(tenantId, parentId, studentId);
    if (!existingLink) throw new NotFoundError('Link not found');

    await ParentRepository.unlinkStudent(tenantId, parentId, studentId);
  }
}
