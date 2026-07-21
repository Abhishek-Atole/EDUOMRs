# DOC 2.7 — Testing Strategy

**Document ID:** 2.7
**Title:** Testing Strategy — Unit, Integration, E2E, Performance & Quality Gates
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Engineering
**Date:** 2026-07-15
**Purpose:** Define the complete testing strategy — test types, coverage targets, tooling, CI integration, and quality gates.

---

## 1. Testing Principles

| Principle | Guideline |
|---|---|
| Shift Left | Test early, test often — catch bugs at the cheapest point |
| Test Pyramid | Lots of unit tests, fewer integration tests, minimal E2E |
| Deterministic | Tests must be repeatable — no flaky tests |
| Fast Feedback | Unit tests < 1 min, Integration < 5 min, E2E < 15 min |
| Isolation | Tests mock/destroy their own data — never share state |
| CI Gate | Failed tests block merge and deploy |

---

## 2. Test Pyramid

```
      ╱╲
     ╱  ╲        E2E (5%)
    ╱    ╲
   ╱──────╲     Integration (20%)
  ╱        ╲
 ╱──────────╲  Unit (75%)
╱            ╲
```

| Layer | Count (MVP) | Runtime | Tools |
|---|---|---|---|
| Unit | 200+ | < 1 min | Jest |
| Integration | 50+ | < 5 min | Jest + Supertest |
| E2E | 15+ | < 15 min | Playwright |

---

## 3. Unit Testing

### 3.1 Scope

Test individual functions and modules in isolation:
- Utils: score calculation, pagination, phone formatting
- Services: business logic (mock database layer)
- Validators: Zod schemas
- Middleware: auth, RBAC, tenant guard

### 3.2 Example: Score Calculation

```javascript
// tests/utils/score.util.test.js
const { calculateScore } = require('../../src/utils/score.util');

describe('calculateScore', () => {
  it('returns perfect score for all correct', () => {
    const result = calculateScore({
      answers: [{ correct: true }, { correct: true }, { correct: true }],
      marksPerCorrect: 4,
      marksPerWrong: 1,
      negativeMarking: true
    });
    expect(result).toEqual({
      totalScore: 12,
      correctCount: 3,
      wrongCount: 0,
      skippedCount: 0
    });
  });

  it('deducts negative marks for wrong answers', () => {
    const result = calculateScore({
      answers: [
        { correct: true },
        { correct: false },
        { correct: null }  // skipped
      ],
      marksPerCorrect: 4,
      marksPerWrong: 1,
      negativeMarking: true
    });
    expect(result).toEqual({
      totalScore: 3,
      correctCount: 1,
      wrongCount: 1,
      skippedCount: 1
    });
  });

  it('returns 0 for skipped answers without negative marking', () => {
    const result = calculateScore({
      answers: [
        { correct: null },
        { correct: null }
      ],
      marksPerCorrect: 4,
      marksPerWrong: 1,
      negativeMarking: false
    });
    expect(result.totalScore).toBe(0);
  });

  it('handles edge case: empty answers array', () => {
    const result = calculateScore({
      answers: [],
      marksPerCorrect: 4,
      marksPerWrong: 1,
      negativeMarking: false
    });
    expect(result.totalScore).toBe(0);
  });
});
```

### 3.3 Example: Service Mocking

```javascript
// tests/services/exam.service.test.js
const { ExamService } = require('../../src/modules/exam/exam.service');

describe('ExamService', () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTenant: jest.fn()
    };
    service = new ExamService(mockRepository);
  });

  it('creates exam with correct defaults', async () => {
    const data = {
      title: 'Test Exam',
      tenantId: 'tenant-uuid',
      createdBy: 'user-uuid'
    };

    mockRepository.create.mockResolvedValue({
      id: 'exam-uuid',
      ...data,
      status: 'draft',
      createdAt: new Date()
    });

    const result = await service.create(data);
    expect(result.status).toBe('draft');
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test Exam' })
    );
  });
});
```

### 3.4 Coverage Target

| Metric | Target | Enforced |
|---|---|---|
| Lines | 85% | CI gate |
| Branches | 80% | CI gate |
| Functions | 90% | CI gate |
| Statements | 85% | CI gate |

---

## 4. Integration Testing

### 4.1 Scope

Test the full request-response cycle for critical paths:
- Auth: register → login → refresh → access protected route
- Exam: create → add questions → publish → start session → submit → score
- Multi-tenant: tenant A cannot access tenant B data
- Error scenarios: invalid input, expired token, deadline passed

### 4.2 Infrastructure

```javascript
// tests/setup.js — test database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

beforeAll(async () => {
  // Use test database (DATABASE_URL_TEST from .env)
  await prisma.$connect();
  await runMigrations('test');
});

afterEach(async () => {
  // Clean all data after each test
  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
  `;
  for (const { tablename } of tablenames) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${tablename}" CASCADE;`
    );
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### 4.3 Example: Auth Flow

```javascript
// tests/integration/auth.flow.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Auth Flow', () => {
  let accessToken;
  let refreshTokenValue;

  it('completes full auth lifecycle', async () => {
    // 1. Register institution
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        institutionName: 'Test School',
        adminEmail: 'admin@test.edu',
        adminPassword: 'SecurePass123!',
        adminFirstName: 'Test',
        adminLastName: 'Admin'
      });
    expect(registerRes.status).toBe(201);

    // 2. Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.edu', password: 'SecurePass123!' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.accessToken).toBeDefined();
    accessToken = loginRes.body.data.accessToken;
    refreshTokenValue = loginRes.body.data.refreshToken;

    // 3. Access protected route
    const meRes = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe('admin@test.edu');

    // 4. Refresh token
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: refreshTokenValue });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeDefined();

    // 5. Logout
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken: refreshTokenValue });
    expect(logoutRes.status).toBe(200);
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'wrong@test.edu', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});
```

### 4.4 Example: Multi-Tenancy Isolation

```javascript
it('prevents cross-tenant data access', async () => {
  // Tenant A creates exam
  const tenantA = await createTenantAndLogin('School A');
  const examRes = await request(app)
    .post('/api/v1/exams')
    .set('Authorization', `Bearer ${tenantA.token}`)
    .send({ title: 'School A Exam', ...examDefaults });
  const examId = examRes.body.data.id;

  // Tenant B cannot access Tenant A's exam
  const tenantB = await createTenantAndLogin('School B');
  const res = await request(app)
    .get(`/api/v1/exams/${examId}`)
    .set('Authorization', `Bearer ${tenantB.token}`);
  expect(res.status).toBe(404);
});
```

---

## 5. E2E Testing

### 5.1 Scope

Critical user journeys through the frontend:
- Student takes Exam Mode 1 (question panel + OMR)
- Student takes Exam Mode 2 (OMR only)
- Teacher releases results → Parent gets WhatsApp
- Super Admin verifies payment

### 5.2 Tooling

- Playwright for browser automation
- Runs against staging environment
- Test data seeded via API calls before each test

### 5.3 Example: Exam Mode 1 Flow

```javascript
// e2e/exam-mode-1.spec.js
test('student completes digital exam', async ({ page }) => {
  // Login as student
  await page.goto('/login');
  await page.fill('[name="email"]', 'student@test.edu');
  await page.fill('[name="password"]', 'TestPass123!');
  await page.click('button[type="submit"]');

  // Navigate to exam lobby
  await page.click('text="Midterm Mathematics"');
  await page.click('text="Start Exam"');

  // Verify left panel shows question, right shows OMR
  await expect(page.locator('[data-testid="question-panel"]')).toBeVisible();
  await expect(page.locator('[data-testid="omr-grid"]')).toBeVisible();

  // Answer first 5 questions
  for (let i = 1; i <= 5; i++) {
    await page.click(`[data-testid="q${i}-option-B"]`);
  }

  // Submit
  await page.click('text="Submit Exam"');
  await page.click('text="Confirm"');

  // Verify result shown
  await expect(page.locator('text="Your Score"')).toBeVisible();
});
```

---

## 6. Performance Testing

### 6.1 Load Test Targets

| Metric | Target | Tool |
|---|---|---|
| Concurrent users | 500 | k6 |
| Requests/second | 100 | k6 |
| p95 response time | < 500ms | k6 |
| p99 response time | < 2000ms | k6 |
| Error rate | < 1% | k6 |

### 6.2 Critical Scenarios to Load Test

- Multiple students starting the same exam simultaneously
- Auto-save spike (all students saving at the 30-second mark)
- Result release (score calculation + notification queue)
- Login storm (all students logging in before exam)

### 6.3 k6 Script Example

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 500 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const loginRes = http.post(
    'https://api.eduomr.com/api/v1/auth/login',
    JSON.stringify({
      email: `student${__VU}@test.edu`,
      password: 'TestPass123!',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, { 'login successful': (r) => r.status === 200 });

  sleep(1);

  const saveRes = http.post(
    `https://api.eduomr.com/api/v1/sessions/${sessionId}/answers`,
    JSON.stringify({
      questionId: 'some-uuid',
      selectedOption: 'B',
    }),
    {
      headers: {
        'Authorization': `Bearer ${loginRes.json('data.accessToken')}`,
        'Content-Type': 'application/json',
      },
    }
  );

  check(saveRes, { 'answer saved': (r) => r.status === 200 });
}
```

---

## 7. Security Testing

| Test Type | Frequency | Tool |
|---|---|---|
| Dependency scanning | Every PR | Dependabot / Snyk |
| SAST (Static Analysis) | Every PR | SonarQube |
| DAST (Dynamic) | Weekly | OWASP ZAP |
| Penetration testing | Quarterly | External vendor |
| API fuzzing | Monthly | Custom (random payloads) |
| Rate limit testing | Per release | k6 + custom assertions |

---

## 8. Test Data Strategy

| Environment | Data Source |
|---|---|
| Local | Seed script with 3 institutions, 5 teachers, 20 students |
| Dev | Anonymized production snapshot (monthly) |
| Staging | Anonymized production snapshot (weekly) |
| E2E | Dedicated seed data (deterministic, never changed) |
| Load test | Synthetic data generator (1000+ students, 50+ exams) |

---

## 9. Quality Gates

### 9.1 PR Gate

```
□ Lint passes (no warnings)
□ All unit tests pass
□ Coverage >= 85%
□ No new vulnerabilities (Dependabot)
□ SonarQube quality gate passes
□ At least 1 reviewer approved
```

### 9.2 Staging Gate

```
□ E2E tests pass (Playwright)
□ Integration tests pass
□ Smoke tests (10 requests, 3 min)
□ No 5xx errors in logs
□ p95 latency < 500ms
```

### 9.3 Production Gate

```
□ Staging gate passed
□ Manual approval by Tech Lead
□ Deployment window (0500-0700 IST)
□ Feature flag on (if applicable)
□ Rollback plan documented
```

---

## 10. Test Automation in CI

```yaml
test:
  steps:
    - run: npm ci
    - run: npm run lint           # Lint
    - run: npm run test:unit      # Jest unit
    - run: npm run test:integ     # Jest integration
    - run: npm run test:coverage  # Coverage report
    - run: npm audit              # Dependency vulns
    - run: sonar-scanner          # SAST
```

---

## 11. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-15 | Approved | Approved by Founder |

---

## 12. Approval Sign-Off

**Document:** DOC 2.7 — Testing Strategy
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-15 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-15 | ✅ Approved |
