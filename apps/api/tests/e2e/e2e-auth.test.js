import request from 'supertest';
import { setupDatabase, seedSuperAdmin, cleanDatabase, teardownDatabase } from './helpers/setup.js';

let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long!';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://eduomr:eduomr_pass@localhost:5433/eduomr_e2e';
  process.env.RATE_LIMIT_MAX_REQUESTS = '10000';
  process.env.AUTH_RATE_LIMIT_MAX = '1000';

  await setupDatabase();
  await cleanDatabase();

  const { default: appModule } = await import('../../src/app.js');
  app = appModule;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('E2E: Auth Flow', () => {
  const tenant = { name: 'E2E Test College', email: 'e2e-admin@test.edu', password: 'Admin@123' };

  it('POST /api/v1/auth/register — creates institution + admin', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        institutionName: tenant.name,
        adminEmail: tenant.email,
        adminPassword: tenant.password,
        adminFirstName: 'Test',
        adminLastName: 'Admin',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.institutionId).toBeDefined();
    tenant.id = res.body.data.institutionId;
  });

  it('POST /api/v1/auth/login — returns tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: tenant.email, password: tenant.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.role).toBe('institution_admin');
    tenant.accessToken = res.body.data.accessToken;
    tenant.refreshToken = res.body.data.refreshToken;
  });

  it('POST /api/v1/auth/refresh — rotates tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: tenant.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(tenant.refreshToken);
    tenant.accessToken = res.body.data.accessToken;
    tenant.refreshToken = res.body.data.refreshToken;
  });

  it('POST /api/v1/auth/logout — revokes refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${tenant.accessToken}`)
      .send({ refreshToken: tenant.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: tenant.refreshToken });
    expect(refreshRes.status).toBe(401);
  });

  it('POST /api/v1/auth/login — wrong password returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: tenant.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
