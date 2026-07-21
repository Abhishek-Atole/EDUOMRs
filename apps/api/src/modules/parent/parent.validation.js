import { z } from 'zod';

export const createParentSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  phone: z.string().min(10).max(20).optional(),
}).strict();

export const updateParentSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().min(10).max(20).optional(),
  isActive: z.boolean().optional(),
}).strict();

export const linkStudentSchema = z.object({
  studentId: z.string().uuid(),
}).strict();
