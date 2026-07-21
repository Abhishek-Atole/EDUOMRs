import { z } from 'zod';

export const saveAnswerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOption: z.string().length(1).nullable(),
}).strict();

export const bulkSaveSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    selectedOption: z.string().length(1).nullable(),
  })),
}).strict();
