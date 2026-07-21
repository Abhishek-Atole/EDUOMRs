import { autoSubmitQueue } from '../infrastructure/queue/queue.client.js';
import { getPrisma } from '../infrastructure/database/prisma.js';
import { calculateAndStoreResult } from '../utils/score.util.js';

autoSubmitQueue.process(async (job) => {
  const { examId } = job.data;

  const prisma = getPrisma();
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) throw new Error(`Exam ${examId} not found`);

  const activeSessions = await prisma.examSession.findMany({
    where: { examId, status: 'in_progress' },
  });

  for (const session of activeSessions) {
    await prisma.examSession.update({
      where: { id: session.id },
      data: { status: 'auto_submitted', submittedAt: new Date() },
    });

    await calculateAndStoreResult(prisma, { ...session, status: 'auto_submitted' }, exam);
  }
});

export async function scheduleAutoSubmit(examId, deadlineAt) {
  const delay = new Date(deadlineAt).getTime() - Date.now();
  if (delay <= 0) return;

  await autoSubmitQueue.add(
    { examId },
    { delay, jobId: `auto-submit-${examId}` }
  );
}

export { autoSubmitQueue };
