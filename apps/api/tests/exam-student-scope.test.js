import { jest } from '@jest/globals';
import { getPrismaMockModule } from './helpers/prisma-mock.js';

jest.unstable_mockModule('../src/infrastructure/database/prisma.js', getPrismaMockModule);

const { ExamService } = await import('../src/modules/exam/exam.service.js');
const { getPrisma } = await import('../src/infrastructure/database/prisma.js');

describe('ExamService student scoping', () => {
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = getPrisma();
  });

  it('list — student query is restricted to published exams in an enrolled class', async () => {
    prisma.exam.findMany.mockResolvedValue([]);
    prisma.exam.count.mockResolvedValue(0);

    await ExamService.list('tenant-1', 1, 10, { id: 'stu-1', role: 'student' });

    const { where } = prisma.exam.findMany.mock.calls[0][0];
    expect(where.status).toEqual({ in: ['published', 'results_released'] });
    expect(where.tenantId).toBe('tenant-1');
    expect(where.class.enrollments.some).toEqual({ studentId: 'stu-1', tenantId: 'tenant-1', isActive: true });
  });

  it('list — teacher query is not restricted to published', async () => {
    prisma.exam.findMany.mockResolvedValue([]);
    prisma.exam.count.mockResolvedValue(0);

    await ExamService.list('tenant-1', 1, 10, { id: 't-1', role: 'teacher' });

    const { where } = prisma.exam.findMany.mock.calls[0][0];
    expect(where.status).toBeUndefined();
    expect(where.class).toBeUndefined();
  });

  it('getById — student is 404 on an exam outside their enrollment', async () => {
    prisma.exam.findFirst.mockResolvedValue(null);

    await expect(
      ExamService.getById('tenant-1', 'exam-9', { id: 'stu-1', role: 'student' })
    ).rejects.toThrow('Exam not found');

    const { where } = prisma.exam.findFirst.mock.calls[0][0];
    expect(where.status).toEqual({ in: ['published', 'results_released'] });
    expect(where.class.enrollments.some.studentId).toBe('stu-1');
  });
});
