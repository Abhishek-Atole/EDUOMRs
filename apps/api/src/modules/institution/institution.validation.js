import { z } from 'zod';

export const updateInstitutionSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  address: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(10).max(20).optional(),
  status: z.enum(['pending', 'active', 'disabled']).optional(),
}).strict();
