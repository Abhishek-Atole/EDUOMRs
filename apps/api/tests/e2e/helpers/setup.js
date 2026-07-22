import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function setupDatabase() {
  execSync('npx prisma migrate deploy', {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'test' },
    stdio: 'pipe',
  });
}

export async function seedSuperAdmin() {
  const hash = await bcrypt.hash('Admin@123', 12);
  const inst = await prisma.institution.create({
    data: {
      name: 'E2E Root Institution',
      status: 'active',
    },
  });
  const user = await prisma.user.create({
    data: {
      tenantId: inst.id,
      email: 'superadmin@eduomr.e2e',
      passwordHash: hash,
      firstName: 'Super',
      role: 'super_admin',
      isActive: true,
    },
  });
  return { institution: inst, user };
}

export async function seedTenant(tenantName) {
  const hash = await bcrypt.hash('Admin@123', 12);
  const inst = await prisma.institution.create({
    data: {
      name: tenantName || 'E2E Tenant',
      status: 'active',
    },
  });
  const admin = await prisma.user.create({
    data: {
      tenantId: inst.id,
      email: `admin@${tenantName?.toLowerCase().replace(/\s+/g, '') || 'e2e-tenant'}.eduomr.e2e`,
      passwordHash: hash,
      firstName: 'Admin',
      role: 'institution_admin',
      isActive: true,
    },
  });
  const teacher = await prisma.user.create({
    data: {
      tenantId: inst.id,
      email: `teacher@${tenantName?.toLowerCase().replace(/\s+/g, '') || 'e2e-tenant'}.eduomr.e2e`,
      passwordHash: hash,
      firstName: 'Teacher',
      role: 'teacher',
      isActive: true,
    },
  });
  const student = await prisma.user.create({
    data: {
      tenantId: inst.id,
      email: `student@${tenantName?.toLowerCase().replace(/\s+/g, '') || 'e2e-tenant'}.eduomr.e2e`,
      passwordHash: hash,
      firstName: 'Student',
      role: 'student',
      isActive: true,
    },
  });
  return { institution: inst, admin, teacher, student };
}

export function generateToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, tenantId: user.tenantId },
    process.env.JWT_SECRET || 'test-secret-that-is-at-least-32-characters-long!',
    { expiresIn: '15m' },
  );
}

export async function cleanDatabase() {
  const tables = [
    'question_results', 'results', 'student_answers', 'exam_sessions',
    'answer_keys', 'questions', 'notification_logs', 'exams',
    'enrollments', 'sections', 'subjects', 'classes', 'academic_years',
    'parent_students', 'refresh_tokens', 'password_reset_tokens',
    'audit_logs', 'payment_uploads', 'subscriptions', 'subscription_plans',
    'users', 'institutions',
  ];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
  }
}

export async function teardownDatabase() {
  await cleanDatabase();
  await prisma.$disconnect();
}

export { prisma };
