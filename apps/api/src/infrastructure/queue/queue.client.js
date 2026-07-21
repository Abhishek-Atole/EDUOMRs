import Queue from 'bull';
import { env } from '../../config/env.js';

export function createQueue(name) {
  return new Queue(name, env.REDIS_URL, {
    prefix: `${env.REDIS_PREFIX}queue:`,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });
}

export const evaluationQueue = createQueue('exam-evaluation');
export const autoSubmitQueue = createQueue('exam-auto-submit');
export const notificationQueue = createQueue('notification');
export const deadLetterQueue = createQueue('dead-letter');
