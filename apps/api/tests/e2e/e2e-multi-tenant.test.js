import request from 'supertest';
import { setupDatabase, seedTenant, seedSuperAdmin, cleanDatabase, teardownDatabase, generateToken } from './helpers/setup.js';

let app;
let tenantA, tenantB;
let examIdA;
let tokenA, tokenB, studentTokenB;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long!';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://eduomr:eduomr_pass@localhost:5433/eduomr_e2e';
  process.env.RATE_LIMIT_MAX_REQUESTS = '10000';

  await setupDatabase();
  await cleanDatabase();

  const { default: appModule } = await import('../../src/app.js');
  app = appModule;

  tenantA = await seedTenant('Tenant A');
  tenantB = await seedTenant('Tenant B');

  tokenA = `Bearer ${generateToken(tenantA.teacher)}`;
  tokenB = `Bearer ${generateToken(tenantB.teacher)}`;
  studentTokenB = `Bearer ${generateToken(tenantB.student)}`;

  const examRes = await request(app)
    .post('/api/v1/exams')
    .set('Authorization', tokenA)
    .send({ title: 'Tenant A Exam', examMode: 'DIGITAL', durationMinutes: 30, totalMarks: 50, marksPerCorrect: 1, marksPerWrong: 0, negativeMarking: false });
  examIdA = examRes.body.data.id;

  const questionsRes = await request(app)
    .post(`/api/v1/questions/exam/${examIdA}`)
    .set('Authorization', tokenA)
    .send({
      questions: [
        { questionText: 'Q1', options: { A: '1', B: '2', C: '3', D: '4' }, correctOption: 'A', marks: 1 },
      ],
    });
  expect(questionsRes.status).toBe(201);

  await request(app)
    .post(`/api/v1/exams/${examIdA}/publish`)
    .set('Authorization', tokenA);
});

afterAll(async () => {
  await teardownDatabase();
});

describe('E2E: Multi-Tenant Isolation', () => {
  it('Tenant B teacher cannot access Tenant A exams', async () => {
    const res = await request(app)
      .get('/api/v1/exams')
      .set('Authorization', tokenB);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(0);
  });

  it('Tenant A teacher can see their own exams', async () => {
    const res = await request(app)
      .get('/api/v1/exams')
      .set('Authorization', tokenA);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Tenant A Exam');
  });

  it('Tenant B student cannot start Tenant A exam session', async () => {
    const res = await request(app)
      .get(`/api/v1/exam-sessions/${examIdA}/start`)
      .set('Authorization', studentTokenB);

    expect(res.status).toBe(404);
  });
});
