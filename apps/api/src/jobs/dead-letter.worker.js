import { deadLetterQueue } from '../infrastructure/queue/queue.client.js';
import { getPrisma } from '../infrastructure/database/prisma.js';

deadLetterQueue.process(async (job) => {
  const { originalQueue, originalJobId, examId, parentName, studentName, examTitle, error } = job.data;

  const prisma = getPrisma();

  const adminUsers = await prisma.user.findMany({
    where: { role: { in: ['super_admin', 'platform_owner'] }, isActive: true },
    select: { id: true, email: true, firstName: true, tenantId: true },
  });

  for (const admin of adminUsers) {
    await prisma.notificationLog.create({
      data: {
        tenantId: admin.tenantId,
        examId: examId || null,
        studentId: null,
        parentId: admin.id,
        channel: 'system',
        status: 'dead_letter',
        message: `[PLATFORM ALERT] Notification permanently failed for ${parentName || 'Unknown Parent'}` +
          (studentName ? ` (student: ${studentName})` : '') +
          (examTitle ? ` for exam "${examTitle}"` : '') +
          `. Queue: ${originalQueue}, Job: ${originalJobId}. Error: ${error || 'Unknown'}`,
        attemptNumber: job.attemptsMade,
        maxRetries: 3,
        sentAt: new Date(),
      },
    });
  }
});

export { deadLetterQueue };
