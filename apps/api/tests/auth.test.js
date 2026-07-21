import bcrypt from 'bcrypt';
import { jest } from '@jest/globals';
import { getPrismaMockModule } from './helpers/prisma-mock.js';

jest.unstable_mockModule('../src/infrastructure/database/prisma.js', getPrismaMockModule);

const { default: app } = await import('../src/app.js');
const { getPrisma } = await import('../src/infrastructure/database/prisma.js');
const { default: request } = await import('supertest');

describe('Auth Module Integration', () => {
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = getPrisma();
  });

  describe('POST /api/v1/auth/register', () => {
    const validRegisterPayload = {
      institutionName: 'Alpha Academy',
      adminEmail: 'admin@alpha.edu',
      adminPassword: 'SecurePassword123!',
      adminFirstName: 'John',
      adminLastName: 'Doe',
      contactPhone: '+919876543210',
    };

    it('should register a new institution and admin successfully', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          institution: {
            create: jest.fn().mockResolvedValue({ id: 'inst-uuid', name: 'Alpha Academy' }),
          },
          user: {
            create: jest.fn().mockResolvedValue({ id: 'user-uuid', email: 'admin@alpha.edu' }),
          },
        };
        return callback(tx);
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegisterPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.institutionId).toBeDefined();
      expect(res.body.data.userId).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const invalidPayload = { ...validRegisterPayload, adminEmail: 'not-an-email' };
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for weak password', async () => {
      const invalidPayload = { ...validRegisterPayload, adminPassword: 'weak' };
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 if email already exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegisterPayload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const validLoginPayload = {
      email: 'admin@alpha.edu',
      password: 'SecurePassword123!',
    };

    it('should login successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('SecurePassword123!', 12);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-uuid',
        email: 'admin@alpha.edu',
        passwordHash: hashedPassword,
        isActive: true,
        role: 'admin',
        tenantId: 'inst-uuid',
        firstName: 'John',
        lastName: 'Doe',
        tenant: { status: 'pending' },
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(validLoginPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.role).toBe('admin');
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it('should return 401 for incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('SecurePassword123!', 12);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-uuid',
        email: 'admin@alpha.edu',
        passwordHash: hashedPassword,
        isActive: true,
        role: 'admin',
        tenantId: 'inst-uuid',
        tenant: { status: 'pending' },
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ ...validLoginPayload, password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return 403 if user is not admin and tenant is pending', async () => {
      const hashedPassword = await bcrypt.hash('SecurePassword123!', 12);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-uuid',
        email: 'student@alpha.edu',
        passwordHash: hashedPassword,
        isActive: true,
        role: 'student',
        tenantId: 'inst-uuid',
        tenant: { status: 'pending' },
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'student@alpha.edu', password: 'SecurePassword123!' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should rotate tokens successfully', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue({
        id: 'token-id',
        userId: 'user-uuid',
        tokenHash: 'some-hash',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
      });

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid',
        email: 'admin@alpha.edu',
        role: 'admin',
        tenantId: 'inst-uuid',
        isActive: true,
      });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'some-raw-token' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should revoke all user tokens on reuse detection', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue({
        id: 'token-id',
        userId: 'user-uuid',
        tokenHash: 'some-hash',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'reused-token' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should revoke the refresh token and return 200', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue({
        id: 'token-id',
        revokedAt: null,
      });

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: 'active-refresh-token' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prisma.refreshToken.update).toHaveBeenCalled();
    });
  });
});
