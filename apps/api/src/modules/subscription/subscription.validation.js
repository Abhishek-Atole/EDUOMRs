import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().positive(),
  durationDays: z.number().int().positive(),
  maxStudents: z.number().int().positive(),
  features: z.array(z.string()).optional(),
}).strict();

export const updatePlanSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  price: z.number().positive().optional(),
  durationDays: z.number().int().positive().optional(),
  maxStudents: z.number().int().positive().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
}).strict();

export const uploadPaymentSchema = z.object({
  planId: z.string().uuid(),
  utrNumber: z.string().min(1).max(22),
  amount: z.number().positive(),
  screenshotUrl: z.string().url().optional(),
}).strict();

export const verifyPaymentSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  rejectionReason: z.string().optional(),
}).strict();
