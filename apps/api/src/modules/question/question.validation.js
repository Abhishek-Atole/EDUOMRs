import { z } from 'zod';

// Options stored as {"A": "text", "B": "text", "C": "text", "D": "text"} per API design doc 2.4 §8.6
const optionsSchema = z.object({
  A: z.string().min(1),
  B: z.string().min(1),
  C: z.string().min(1),
  D: z.string().min(1),
}).strict();

export const createQuestionsSchema = z.object({
  questions: z.array(z.object({
    questionText: z.string().min(1),
    options: optionsSchema,
    correctOption: z.enum(['A', 'B', 'C', 'D']),
    marks: z.number().positive().default(1),
    orderIndex: z.number().int().min(1).optional(),
  })).min(1),
});

export const updateQuestionSchema = z.object({
  questionText: z.string().min(1).optional(),
  options: optionsSchema.optional(),
  correctOption: z.enum(['A', 'B', 'C', 'D']).optional(),
  marks: z.number().positive().optional(),
});
