import { jest } from '@jest/globals';
import { getPrismaMockModule } from './helpers/prisma-mock.js';

jest.unstable_mockModule('../src/infrastructure/database/prisma.js', getPrismaMockModule);
jest.unstable_mockModule('../src/modules/notification/notification.service.js', () => ({
  NotificationService: { sendResultNotifications: jest.fn() },
}));

const { ResultService } = await import('../src/modules/result/result.service.js');
const { getPrisma } = await import('../src/infrastructure/database/prisma.js');

describe('ResultService parent scoping', () => {
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = getPrisma();
  });

  it('rejects a parent not linked to the student', async () => {
    prisma.parentStudent.findFirst.mockResolvedValue(null);

    await expect(
      ResultService.getChildResults('tenant-1', 'stu-1', 'parent-9')
    ).rejects.toThrow('Student not found');

    expect(prisma.parentStudent.findFirst.mock.calls[0][0].where)
      .toEqual({ tenantId: 'tenant-1', parentId: 'parent-9', studentId: 'stu-1' });
    expect(prisma.result.findMany).not.toHaveBeenCalled();
  });

  it('returns only released results for a linked child', async () => {
    prisma.parentStudent.findFirst.mockResolvedValue({
      student: { id: 'stu-1', firstName: 'A', lastName: 'B', email: 'a@b.c' },
    });
    prisma.result.findMany.mockResolvedValue([{ id: 'res-1' }]);

    const out = await ResultService.getChildResults('tenant-1', 'stu-1', 'parent-1');

    expect(out.student.id).toBe('stu-1');
    expect(out.results).toHaveLength(1);
    expect(prisma.result.findMany.mock.calls[0][0].where.isReleased).toBe(true);
  });
});
