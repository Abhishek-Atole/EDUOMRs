import { getPrisma } from '../../infrastructure/database/prisma.js';

export class AcademicRepository {
  /* ── Academic Year ── */
  static async findAllYears(tenantId, page, limit, skip) {
    const prisma = getPrisma();
    const where = { tenantId };
    const [data, total] = await Promise.all([
      prisma.academicYear.findMany({ where, orderBy: { startDate: 'desc' }, skip, take: limit }),
      prisma.academicYear.count({ where }),
    ]);
    return { data, total };
  }

  static async findYearById(tenantId, id) {
    const prisma = getPrisma();
    return prisma.academicYear.findFirst({ where: { id, tenantId } });
  }

  static async createYear(tenantId, data) {
    const prisma = getPrisma();
    return prisma.academicYear.create({ data: { ...data, tenantId } });
  }

  static async updateYear(tenantId, id, data) {
    const prisma = getPrisma();
    return prisma.academicYear.update({ where: { id }, data });
  }

  static async deleteYear(tenantId, id) {
    const prisma = getPrisma();
    return prisma.academicYear.delete({ where: { id } });
  }

  /* ── Class ── */
  static async findAllClasses(tenantId, page, limit, skip) {
    const prisma = getPrisma();
    const where = { tenantId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.class.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit, include: { academicYear: { select: { name: true } }, _count: { select: { sections: true, subjects: true, enrollments: true } } } }),
      prisma.class.count({ where }),
    ]);
    return { data, total };
  }

  static async findClassById(tenantId, id) {
    const prisma = getPrisma();
    return prisma.class.findFirst({ where: { id, tenantId, deletedAt: null }, include: { academicYear: true, sections: true, subjects: true } });
  }

  static async createClass(tenantId, data) {
    const prisma = getPrisma();
    return prisma.class.create({ data: { ...data, tenantId } });
  }

  static async updateClass(tenantId, id, data) {
    const prisma = getPrisma();
    return prisma.class.update({ where: { id }, data });
  }

  static async softDeleteClass(tenantId, id) {
    const prisma = getPrisma();
    return prisma.class.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  /* ── Section ── */
  static async findAllSections(tenantId, classId) {
    const prisma = getPrisma();
    return prisma.section.findMany({ where: { tenantId, classId, deletedAt: null }, orderBy: { name: 'asc' } });
  }

  static async findSectionById(tenantId, id) {
    const prisma = getPrisma();
    return prisma.section.findFirst({ where: { id, tenantId, deletedAt: null } });
  }

  static async createSection(tenantId, data) {
    const prisma = getPrisma();
    return prisma.section.create({ data: { ...data, tenantId } });
  }

  static async updateSection(tenantId, id, data) {
    const prisma = getPrisma();
    return prisma.section.update({ where: { id }, data });
  }

  static async softDeleteSection(tenantId, id) {
    const prisma = getPrisma();
    return prisma.section.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  /* ── Subject ── */
  static async findAllSubjects(tenantId, classId) {
    const prisma = getPrisma();
    return prisma.subject.findMany({ where: { tenantId, classId, deletedAt: null }, orderBy: { name: 'asc' } });
  }

  static async findSubjectById(tenantId, id) {
    const prisma = getPrisma();
    return prisma.subject.findFirst({ where: { id, tenantId, deletedAt: null } });
  }

  static async createSubject(tenantId, data) {
    const prisma = getPrisma();
    return prisma.subject.create({ data: { ...data, tenantId } });
  }

  static async updateSubject(tenantId, id, data) {
    const prisma = getPrisma();
    return prisma.subject.update({ where: { id }, data });
  }

  static async softDeleteSubject(tenantId, id) {
    const prisma = getPrisma();
    return prisma.subject.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  /* ── Enrollment ── */
  static async findAllEnrollments(tenantId, page, limit, skip) {
    const prisma = getPrisma();
    const where = { tenantId };
    const [data, total] = await Promise.all([
      prisma.enrollment.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: { class: { select: { name: true } }, section: { select: { name: true } }, academicYear: { select: { name: true } } } }),
      prisma.enrollment.count({ where }),
    ]);
    return { data, total };
  }

  static async createEnrollment(tenantId, data) {
    const prisma = getPrisma();
    return prisma.enrollment.create({ data: { ...data, tenantId } });
  }

  static async deleteEnrollment(tenantId, id) {
    const prisma = getPrisma();
    return prisma.enrollment.delete({ where: { id } });
  }
}
