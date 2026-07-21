import { AcademicRepository } from './academic.repository.js';
import { getPrisma } from '../../infrastructure/database/prisma.js';
import { NotFoundError } from '../../types/errors.js';

export class AcademicService {
  /* ── Academic Year ── */
  static async listYears(tenantId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return AcademicRepository.findAllYears(tenantId, page, limit, skip);
  }

  static async getYear(tenantId, id) {
    const year = await AcademicRepository.findYearById(tenantId, id);
    if (!year) throw new NotFoundError('Academic year not found');
    return year;
  }

  static async createYear(tenantId, data) {
    return AcademicRepository.createYear(tenantId, {
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isCurrent: data.isCurrent || false,
    });
  }

  static async updateYear(tenantId, id, data) {
    const year = await AcademicRepository.findYearById(tenantId, id);
    if (!year) throw new NotFoundError('Academic year not found');

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.isCurrent !== undefined) updateData.isCurrent = data.isCurrent;

    if (data.isCurrent) {
      const prisma = getPrisma();
      await prisma.academicYear.updateMany({ where: { tenantId, isCurrent: true }, data: { isCurrent: false } });
    }

    return AcademicRepository.updateYear(tenantId, id, updateData);
  }

  static async deleteYear(tenantId, id) {
    const year = await AcademicRepository.findYearById(tenantId, id);
    if (!year) throw new NotFoundError('Academic year not found');
    await AcademicRepository.deleteYear(tenantId, id);
  }

  /* ── Class ── */
  static async listClasses(tenantId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return AcademicRepository.findAllClasses(tenantId, page, limit, skip);
  }

  static async getClass(tenantId, id) {
    const cls = await AcademicRepository.findClassById(tenantId, id);
    if (!cls) throw new NotFoundError('Class not found');
    return cls;
  }

  static async createClass(tenantId, data) {
    return AcademicRepository.createClass(tenantId, {
      name: data.name,
      academicYearId: data.academicYearId || null,
    });
  }

  static async updateClass(tenantId, id, data) {
    const cls = await AcademicRepository.findClassById(tenantId, id);
    if (!cls) throw new NotFoundError('Class not found');
    return AcademicRepository.updateClass(tenantId, id, data);
  }

  static async deleteClass(tenantId, id) {
    const cls = await AcademicRepository.findClassById(tenantId, id);
    if (!cls) throw new NotFoundError('Class not found');
    await AcademicRepository.softDeleteClass(tenantId, id);
  }

  /* ── Section ── */
  static async listSections(tenantId, classId) {
    return AcademicRepository.findAllSections(tenantId, classId);
  }

  static async createSection(tenantId, data) {
    const prisma = getPrisma();
    const cls = await prisma.class.findFirst({ where: { id: data.classId, tenantId, deletedAt: null } });
    if (!cls) throw new NotFoundError('Class not found');
    return AcademicRepository.createSection(tenantId, data);
  }

  static async updateSection(tenantId, id, data) {
    const section = await AcademicRepository.findSectionById(tenantId, id);
    if (!section) throw new NotFoundError('Section not found');
    return AcademicRepository.updateSection(tenantId, id, data);
  }

  static async deleteSection(tenantId, id) {
    const section = await AcademicRepository.findSectionById(tenantId, id);
    if (!section) throw new NotFoundError('Section not found');
    await AcademicRepository.softDeleteSection(tenantId, id);
  }

  /* ── Subject ── */
  static async listSubjects(tenantId, classId) {
    return AcademicRepository.findAllSubjects(tenantId, classId);
  }

  static async createSubject(tenantId, data) {
    const prisma = getPrisma();
    const cls = await prisma.class.findFirst({ where: { id: data.classId, tenantId, deletedAt: null } });
    if (!cls) throw new NotFoundError('Class not found');
    return AcademicRepository.createSubject(tenantId, data);
  }

  static async updateSubject(tenantId, id, data) {
    const subject = await AcademicRepository.findSubjectById(tenantId, id);
    if (!subject) throw new NotFoundError('Subject not found');
    return AcademicRepository.updateSubject(tenantId, id, data);
  }

  static async deleteSubject(tenantId, id) {
    const subject = await AcademicRepository.findSubjectById(tenantId, id);
    if (!subject) throw new NotFoundError('Subject not found');
    await AcademicRepository.softDeleteSubject(tenantId, id);
  }

  /* ── Enrollment ── */
  static async listEnrollments(tenantId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return AcademicRepository.findAllEnrollments(tenantId, page, limit, skip);
  }

  static async createEnrollment(tenantId, data) {
    const prisma = getPrisma();
    const student = await prisma.user.findFirst({ where: { id: data.studentId, tenantId, role: 'student', deletedAt: null } });
    if (!student) throw new NotFoundError('Student not found');

    const cls = await prisma.class.findFirst({ where: { id: data.classId, tenantId, deletedAt: null } });
    if (!cls) throw new NotFoundError('Class not found');

    return AcademicRepository.createEnrollment(tenantId, data);
  }

  static async deleteEnrollment(tenantId, id) {
    await AcademicRepository.deleteEnrollment(tenantId, id);
  }
}
