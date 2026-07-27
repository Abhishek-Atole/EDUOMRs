import { z } from 'zod';

// Options stored as {"A": "text", ..., "F": "text"} per API design doc 2.4 §8.6.
// A-D are mandatory; E and F are optional extras.
const optionsSchema = z.object({
  A: z.string().min(1),
  B: z.string().min(1),
  C: z.string().min(1),
  D: z.string().min(1),
  E: z.string().min(1).optional(),
  F: z.string().min(1).optional(),
}).strict();

export const createQuestionsSchema = z.object({
  questions: z.array(z.object({
    questionText: z.string().min(1),
    options: optionsSchema,
    correctOption: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
    marks: z.number().positive().default(1),
    orderIndex: z.number().int().min(1).optional(),
  })).min(1),
});

export const updateQuestionSchema = z.object({
  questionText: z.string().min(1).optional(),
  options: optionsSchema.optional(),
  correctOption: z.enum(['A', 'B', 'C', 'D', 'E', 'F']).optional(),
  marks: z.number().positive().optional(),
});
