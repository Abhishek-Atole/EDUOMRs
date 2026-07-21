import request from 'supertest';
import { setupDatabase, seedTenant, seedSuperAdmin, cleanDatabase, teardownDatabase } from './helpers/setup.js';

let app;
let adminToken, teacherToken, studentToken;
let examId, sessionId, questionIds = [];

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long!';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://eduomr:eduomr_pass@localhost:5433/eduomr_e2e';
  process.env.RATE_LIMIT_MAX_REQUESTS = '10000';
  process.env.AUTH_RATE_LIMIT_MAX = '1000';
  process.env.ANSWER_RATE_LIMIT_MAX = '1000';

  await setupDatabase();
  await cleanDatabase();

  const { default: appModule } = await import('../../src/app.js');
  app = appModule;

  const users = await seedTenant('E2E Exam College');
  const { generateToken } = await import('./helpers/setup.js');
  adminToken = `Bearer ${generateToken(users.admin)}`;
  teacherToken = `Bearer ${generateToken(users.teacher)}`;
  studentToken = `Bearer ${generateToken(users.student)}`;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('E2E: Full Exam Flow', () => {
  it('POST /api/v1/exams — teacher creates exam', async () => {
    const res = await request(app)
      .post('/api/v1/exams')
      .set('Authorization', teacherToken)
      .send({
        title: 'E2E Midterm Exam',
        examMode: 'DIGITAL',
        durationMinutes: 60,
        totalMarks: 100,
        marksPerCorrect: 4,
        marksPerWrong: 0,
        negativeMarking: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    examId = res.body.data.id;
  });

  it('POST /api/v1/questions/exam/:examId — teacher adds questions', async () => {
    const questions = [
      { questionText: 'What is 2+2?', options: { A: '3', B: '4', C: '5', D: '6' }, correctOption: 'B', marks: 4 },
      { questionText: 'What is the capital of France?', options: { A: 'London', B: 'Berlin', C: 'Paris', D: 'Madrid' }, correctOption: 'C', marks: 4 },
      { questionText: 'Which planet is known as Red Planet?', options: { A: 'Venus', B: 'Jupiter', C: 'Mars', D: 'Saturn' }, correctOption: 'C', marks: 4 },
    ];

    const res = await request(app)
      .post(`/api/v1/questions/exam/${examId}`)
      .set('Authorization', teacherToken)
      .send({ questions });

    expect(res.status).toBe(201);
  });

  it('POST /api/v1/exams/:examId/publish — teacher publishes exam', async () => {
    const res = await request(app)
      .post(`/api/v1/exams/${examId}/publish`)
      .set('Authorization', teacherToken);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('published');
  });

  it('GET /api/v1/exam-sessions/:examId/start — student starts session (Mode 1)', async () => {
    const res = await request(app)
      .get(`/api/v1/exam-sessions/${examId}/start`)
      .set('Authorization', studentToken);

    expect(res.status).toBe(200);
    expect(res.body.data.session.id).toBeDefined();
    expect(res.body.data.questions).toBeDefined();
    expect(res.body.data.questions.length).toBe(3);
    expect(res.body.data.exam.examMode).toBe('DIGITAL');
    sessionId = res.body.data.session.id;

    res.body.data.questions.forEach((q, i) => {
      expect(typeof q.id).toBe('string');
      expect(q.options).toBeDefined();
      expect(q.correctOption).toBeUndefined();
      questionIds.push(q.id);
    });
  });

  it('POST /api/v1/submissions/:sessionId/bulk-save — student saves answers', async () => {
    const res = await request(app)
      .post(`/api/v1/submissions/${sessionId}/bulk-save`)
      .set('Authorization', studentToken)
      .send({
        answers: [
          { questionId: questionIds[0], selectedOption: 'B' },
          { questionId: questionIds[1], selectedOption: 'C' },
          { questionId: questionIds[2], selectedOption: 'A' },
        ],
      });

    expect(res.status).toBe(200);
  });

  it('POST /api/v1/submissions/:sessionId/submit — student submits exam (triggers auto-evaluation)', async () => {
    const res = await request(app)
      .post(`/api/v1/submissions/${sessionId}/submit`)
      .set('Authorization', studentToken);

    expect(res.status).toBe(200);
  });

  it('POST /api/v1/results/exam/:examId/release — teacher releases results', async () => {
    const res = await request(app)
      .post(`/api/v1/results/exam/${examId}/release`)
      .set('Authorization', teacherToken);

    expect(res.status).toBe(200);
  });

  it('GET /api/v1/results/exam/:examId/my — student views result with breakdown', async () => {
    const res = await request(app)
      .get(`/api/v1/results/exam/${examId}/my`)
      .set('Authorization', studentToken);

    expect(res.status).toBe(200);
    expect(Number(res.body.data.totalScore)).toBe(8);
    expect(res.body.data.correctCount).toBe(2);
    expect(res.body.data.wrongCount).toBe(1);
    expect(res.body.data.skippedCount).toBe(0);
    const perQuestion = res.body.data.questionResults || res.body.data.breakdown || [];
    expect(perQuestion).toBeDefined();
    expect(perQuestion.length).toBe(3);
    const correct = perQuestion.filter((b) => b.isCorrect);
    expect(correct.length).toBe(2);
  });
});
