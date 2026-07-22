import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import { getPrismaMockModule } from './helpers/prisma-mock.js';

jest.unstable_mockModule('../src/infrastructure/database/prisma.js', getPrismaMockModule);

jest.unstable_mockModule('../src/infrastructure/cache/redis.js', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  delCache: jest.fn(),
}));

const { default: app } = await import('../src/app.js');
const { getPrisma } = await import('../src/infrastructure/database/prisma.js');
const { default: request } = await import('supertest');

function generateToken(overrides = {}) {
  return jwt.sign(
    { sub: overrides.userId || 'user-uuid', role: overrides.role || 'super_admin', tenantId: overrides.tenantId || null },
    process.env.JWT_SECRET || 'test-secret-that-is-at-least-32-characters-long!',
    { algorithm: 'HS256', expiresIn: '15m', issuer: 'eduomr' }
  );
}

describe('Phase C — Institution + Subscription', () => {
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = getPrisma();
  });

  describe('Institution CRUD', () => {
    const adminToken = generateToken({ role: 'super_admin' });
    const userToken = generateToken({ role: 'institution_admin', tenantId: 'inst-uuid' });

    it('GET /api/v1/institutions — lists institutions (super admin)', async () => {
      prisma.institution.findMany.mockResolvedValue([{ id: 'inst-1', name: 'Test', status: 'active' }]);
      prisma.institution.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/institutions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('GET /api/v1/institutions — rejects non-super-admin', async () => {
      const res = await request(app)
        .get('/api/v1/institutions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('GET /api/v1/institutions/:id — returns institution', async () => {
      prisma.institution.findFirst.mockResolvedValue({ id: 'inst-uuid', name: 'Test' });

      const res = await request(app)
        .get('/api/v1/institutions/inst-uuid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('inst-uuid');
    });

    it('GET /api/v1/institutions/:id — 404 if not found', async () => {
      prisma.institution.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/institutions/missing')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('DELETE /api/v1/institutions/:id — soft deletes', async () => {
      prisma.institution.findFirst.mockResolvedValue({ id: 'inst-uuid' });
      prisma.institution.update.mockResolvedValue({ id: 'inst-uuid', deletedAt: new Date() });

      const res = await request(app)
        .delete('/api/v1/institutions/inst-uuid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(prisma.institution.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
      );
    });
  });

  describe('Subscription Plans', () => {
    const adminToken = generateToken({ role: 'super_admin' });

    it('GET /api/v1/plans — public list', async () => {
      prisma.subscriptionPlan.findMany.mockResolvedValue([{ id: 'plan-1', name: 'Basic', price: 5000 }]);

      const res = await request(app).get('/api/v1/plans');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('POST /api/v1/plans — super admin creates plan', async () => {
      prisma.subscriptionPlan.create.mockResolvedValue({ id: 'plan-1', name: 'Pro', price: 10000 });

      const res = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Pro', price: 10000, durationDays: 365, maxStudents: 500 });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe('plan-1');
    });

    it('POST /api/v1/plans — 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Pro' });

      expect(res.status).toBe(400);
    });
  });

  describe('Payment Upload & Verification', () => {
    const adminToken = generateToken({ role: 'institution_admin', tenantId: 'inst-uuid' });
    const superAdminToken = generateToken({ role: 'super_admin' });

    it('POST /api/v1/payments/upload — admin uploads payment', async () => {
      prisma.paymentUpload.create.mockResolvedValue({
        id: 'pay-1', tenantId: 'inst-uuid', planId: '5f8d3a2e-1b9c-4e7a-8d6f-3c2a1b0e9f8d', utrNumber: 'UTR123', amount: 5000, status: 'pending',
      });

      const res = await request(app)
        .post('/api/v1/payments/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ planId: '5f8d3a2e-1b9c-4e7a-8d6f-3c2a1b0e9f8d', utrNumber: 'UTR123', amount: 5000 });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('pending');
    });

    it('PATCH /api/v1/payments/:id/verify — super admin verifies and activates subscription', async () => {
      prisma.paymentUpload.findUnique.mockResolvedValue({ id: 'pay-1', tenantId: 'inst-uuid', planId: 'plan-1', amount: 5000, status: 'pending' });
      prisma.paymentUpload.update.mockResolvedValue({ id: 'pay-1', status: 'verified' });
      prisma.subscriptionPlan.findUnique.mockResolvedValue({ id: 'plan-1', durationDays: 365 });
      prisma.subscription.create.mockResolvedValue({ id: 'sub-1', status: 'active' });

      const res = await request(app)
        .patch('/api/v1/payments/pay-1/verify')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'verified' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('verified');
    });

    it('PATCH /api/v1/payments/:id/verify — 409 if already verified', async () => {
      prisma.paymentUpload.findUnique.mockResolvedValue({ id: 'pay-1', status: 'verified' });

      const res = await request(app)
        .patch('/api/v1/payments/pay-1/verify')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'verified' });

      expect(res.status).toBe(409);
    });
  });

  describe('Subscription Status', () => {
    const adminToken = generateToken({ role: 'institution_admin', tenantId: 'inst-uuid' });

    it('GET /api/v1/subscriptions — returns active subscription', async () => {
      prisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-1', status: 'active', endDate: new Date(Date.now() + 86400000),
        plan: { name: 'Pro', price: 10000 },
      });

      const res = await request(app)
        .get('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('active');
    });

    it('GET /api/v1/subscriptions — returns inactive if none found', async () => {
      prisma.subscription.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('inactive');
    });
  });
});
