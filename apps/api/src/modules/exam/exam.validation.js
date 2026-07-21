import { z } from 'zod';

export const createExamSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  examMode: z.enum(['DIGITAL', 'PHYSICAL_PAPER']),
  totalMarks: z.number().int().positive(),
  passingMarks: z.number().int().min(0).optional(),
  marksPerCorrect: z.number().int().positive().optional(),
  marksPerWrong: z.number().min(0).optional(),
  negativeMarking: z.boolean().default(false),
  negativeMarksPerQuestion: z.number().min(0).default(0),
  instructions: z.string().optional(),
  durationMinutes: z.number().int().positive(),
  scheduledAt: z.string().datetime().optional(),
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
}).strict();

export const updateExamSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  totalMarks: z.number().int().positive().optional(),
  passingMarks: z.number().int().min(0).optional(),
  marksPerCorrect: z.number().int().positive().optional(),
  marksPerWrong: z.number().min(0).optional(),
  negativeMarking: z.boolean().optional(),
  negativeMarksPerQuestion: z.number().min(0).optional(),
  instructions: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  scheduledAt: z.string().datetime().optional(),
  classId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
}).strict();

export const publishExamSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  deadlineAt: z.string().datetime().optional(),
}).strict();
