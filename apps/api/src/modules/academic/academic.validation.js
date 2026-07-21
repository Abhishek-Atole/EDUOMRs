import { z } from 'zod';

export const createYearSchema = z.object({
  name: z.string().min(1).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isCurrent: z.boolean().optional(),
}).strict();

export const updateYearSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isCurrent: z.boolean().optional(),
}).strict();

export const createClassSchema = z.object({
  name: z.string().min(1).max(100),
  academicYearId: z.string().uuid().optional(),
}).strict();

export const updateClassSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  academicYearId: z.string().uuid().optional(),
}).strict();

export const createSectionSchema = z.object({
  classId: z.string().uuid(),
  name: z.string().min(1).max(100),
}).strict();

export const updateSectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
}).strict();

export const createSubjectSchema = z.object({
  classId: z.string().uuid(),
  name: z.string().min(1).max(100),
  code: z.string().max(20).optional(),
}).strict();

export const updateSubjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().max(20).optional(),
}).strict();

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
}).strict();
