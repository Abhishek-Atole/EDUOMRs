import { evaluationQueue } from '../infrastructure/queue/queue.client.js';
import { getPrisma } from '../infrastructure/database/prisma.js';
import { calculateAndStoreResult } from '../utils/score.util.js';

evaluationQueue.process(async (job) => {
  const { examSessionId } = job.data;

  const prisma = getPrisma();
  const session = await prisma.examSession.findUnique({
    where: { id: examSessionId },
    include: { exam: true },
  });

  if (!session) throw new Error(`Exam session ${examSessionId} not found`);

  await calculateAndStoreResult(prisma, session, session.exam);
});

export { evaluationQueue };
