import { z } from 'zod';

// Per API design doc 2.4 §8.10: entries is an array of {questionNumber, correctOption}
export const uploadAnswerKeySchema = z.object({
  entries: z.array(z.object({
    questionNumber: z.number().int().min(1),
    correctOption: z.enum(['A', 'B', 'C', 'D']),
  })).min(1),
});
