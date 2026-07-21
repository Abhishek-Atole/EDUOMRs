# DOC 0.7 — AI Testing Prompt

**Document ID:** 0.7  
**Title:** AI Testing Prompt — Comprehensive Testing Strategy & Framework  
**Version:** 1.0.0  
**Status:** Approved  
**Owner:** AI Testing Process  
**Date:** 2026-07-13  
**Purpose:** Define the comprehensive testing protocol for all code, features, and infrastructure in EduOMR to ensure reliability, correctness, and exam integrity.

---

## 1. Mission

The AI Testing framework is responsible for ensuring:

- **Correctness:** Code behaves as specified
- **Reliability:** Systems work consistently under load
- **Regression Prevention:** Fixes don't break existing functionality
- **Exam Integrity:** Exam logic is tamperproof and accurate
- **Data Integrity:** Multi-tenancy isolation is enforced
- **Performance:** Response times meet SLA targets
- **Security:** Security controls are effective
- **Accessibility:** UI is usable by all users

Every test must enforce:
- **Clean Code:** Tests are maintainable and readable
- **Fast Feedback:** Unit tests run in < 1 second per test
- **Isolation:** Tests don't depend on each other
- **Deterministic:** Tests pass/fail consistently (no flakiness)
- **Coverage:** Critical paths covered (target: > 80%)

---

## 2. Testing Pyramid

```
        /\
       /E2E\
      /------\          (10%)  End-to-End Tests
     /        \                Few, Slow, Expensive
    /----------\
   /Integration \       (20%)  Integration Tests
  /            \              Medium Speed, Medium Cost
 /              \
/________________\      (70%)  Unit Tests
  Unit Tests            Many, Fast, Cheap
```

**Allocation:**
- **70% Unit Tests:** Fast, isolated, developer-focused
- **20% Integration Tests:** Multiple components, database involved
- **10% E2E Tests:** Full user flows, UI automation

---

## 3. Unit Testing Strategy

### 3.1 Unit Test Scope

**What to Unit Test:**
- Business logic (score calculation, permission checks, validation)
- Utility functions (formatting, parsing, calculations)
- Service methods (with mocked dependencies)
- Controllers (with mocked services)
- Middleware (authentication, validation)
- React components (with mocked API calls)

**What NOT to Unit Test:**
- External API calls (mock them)
- Database queries (mock them, test via integration tests)
- Third-party libraries (assume they work)
- UI rendering details (test via component tests)
- Network behavior (test via integration/E2E)

### 3.2 Unit Test Structure

**Framework:** Jest + Supertest (backend), Jest (frontend)

**Test File Organization:**
```
src/
├── modules/
│   ├── exam/
│   │   ├── services/
│   │   │   ├── ExamService.js
│   │   │   └── ExamService.test.js          ← Test file
│   │   ├── controllers/
│   │   │   ├── ExamController.js
│   │   │   └── ExamController.test.js       ← Test file
│   │   ├── repositories/
│   │   │   ├── ExamRepository.js
│   │   │   └── ExamRepository.test.js       ← Test file
```

### 3.3 Unit Test Template

```javascript
describe('ScoreCalculationService', () => {
  let service;

  beforeEach(() => {
    service = new ScoreCalculationService();
  });

  describe('calculateScore', () => {
    it('should calculate correct score with no negative marking', () => {
      // Arrange
      const answers = ['A', 'B', 'C', null];
      const answerKey = ['A', 'B', 'C', 'D'];
      const config = {
        marksPerCorrect: 4,
        marksPerWrong: 0,
        totalQuestions: 4,
      };

      // Act
      const result = service.calculateScore(answers, answerKey, config);

      // Assert
      expect(result.correctCount).toBe(3);
      expect(result.wrongCount).toBe(0);
      expect(result.skippedCount).toBe(1);
      expect(result.totalScore).toBe(12);
      expect(result.percentage).toBe(75.0);
    });

    it('should apply negative marking correctly', () => {
      // Arrange
      const answers = ['A', 'B', 'X', null];
      const answerKey = ['A', 'B', 'C', 'D'];
      const config = {
        marksPerCorrect: 4,
        marksPerWrong: 1,
        clampToZero: true,
        totalQuestions: 4,
      };

      // Act
      const result = service.calculateScore(answers, answerKey, config);

      // Assert
      expect(result.correctCount).toBe(2);
      expect(result.wrongCount).toBe(1);
      expect(result.skippedCount).toBe(1);
      expect(result.totalScore).toBe(7); // 2*4 - 1
      expect(result.percentage).toBe(58.33);
    });

    it('should clamp score to zero if configured', () => {
      // Arrange
      const answers = ['X', 'X', 'X', 'X'];
      const answerKey = ['A', 'B', 'C', 'D'];
      const config = {
        marksPerCorrect: 2,
        marksPerWrong: 1,
        clampToZero: true,
        totalQuestions: 4,
      };

      // Act
      const result = service.calculateScore(answers, answerKey, config);

      // Assert
      expect(result.totalScore).toBe(0); // Clamped
      expect(result.percentage).toBe(0);
    });

    it('should not clamp score if configured', () => {
      // Arrange
      const answers = ['X', 'X', 'X', 'X'];
      const answerKey = ['A', 'B', 'C', 'D'];
      const config = {
        marksPerCorrect: 2,
        marksPerWrong: 1,
        clampToZero: false,
        totalQuestions: 4,
      };

      // Act
      const result = service.calculateScore(answers, answerKey, config);

      // Assert
      expect(result.totalScore).toBe(-4); // Not clamped
      expect(result.percentage).toBe(-50);
    });
  });
});
```

### 3.4 Unit Test Checklist

- [ ] Test file exists for every module
- [ ] Every public function has at least 1 test
- [ ] Happy path tested
- [ ] Edge cases tested (null, empty, boundary values)
- [ ] Error cases tested (exceptions, invalid input)
- [ ] Mocks used for dependencies
- [ ] No database calls in unit tests
- [ ] No external API calls in unit tests
- [ ] Tests run in < 1 second each
- [ ] Test name describes what is tested
- [ ] Test is deterministic (no randomness, same result every run)
- [ ] Test is isolated (no dependencies on other tests)

---

## 4. Integration Testing Strategy

### 4.1 Integration Test Scope

**What to Integration Test:**
- API endpoints (full request → response)
- Database operations (with real DB or test DB)
- Service interactions (multiple services working together)
- Multi-tenancy isolation (tenant_id enforcement)
- Authorization logic (RBAC working end-to-end)
- Exam submission workflow (answers → storage → score calculation)
- Result release workflow (result → notification queued)

**What NOT to Integration Test:**
- Notification delivery (mock external services)
- PDF generation details (mock Puppeteer)
- Email content rendering (mock Nodemailer)

### 4.2 Integration Test Setup

**Test Database:**
- Separate PostgreSQL instance or test database
- Reset before each test suite (fresh state)
- Use transactions to rollback after tests (optional, but recommended)

**Test Fixtures:**
- Pre-populated test data (institutions, users, exams)
- Consistent across all tests
- Version controlled

**Test Configuration:**
```javascript
// jest.config.integration.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.integration.test.js'],
  setupFilesAfterEnv: ['<rootDir>/test/setup-integration.js'],
  testTimeout: 30000, // Integration tests can be slower
};
```

### 4.3 Integration Test Template

```javascript
describe('ExamSubmissionAPI', () => {
  let app;
  let db;
  let studentToken;
  let examId;

  beforeAll(async () => {
    app = await setupApp();
    db = await setupTestDatabase();
  });

  beforeEach(async () => {
    await db.truncateAll();
    const { institution, user } = await db.seedTestData();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'test123' });
    studentToken = loginRes.body.token;
    examId = (await db.createExam(institution.id)).id;
  });

  afterAll(async () => {
    await db.close();
  });

  describe('POST /api/exams/:examId/submit', () => {
    it('should submit exam and calculate score correctly', async () => {
      // Arrange
      const answers = {
        1: 'A',
        2: 'B',
        3: 'C',
        4: null,
      };

      // Act
      const res = await request(app)
        .post(`/api/exams/${examId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers });

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.score).toBeGreaterThan(0);
      expect(res.body.percentage).toBeDefined();

      // Verify stored in database
      const storedResult = await db.getResult(examId);
      expect(storedResult.score).toBe(res.body.score);
      expect(storedResult.answers).toEqual(answers);
    });

    it('should enforce exam deadline server-side', async () => {
      // Arrange: Exam already finished
      const now = new Date();
      await db.updateExam(examId, { 
        started_at: new Date(now - 61 * 60 * 1000),
        duration: 60 
      });

      // Act
      const res = await request(app)
        .post(`/api/exams/${examId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: { 1: 'A' } });

      // Assert
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('Exam time expired');
    });

    it('should prevent cross-tenant exam access', async () => {
      // Arrange: Other tenant's exam
      const otherTenantExam = await db.createExamForOtherTenant();

      // Act
      const res = await request(app)
        .post(`/api/exams/${otherTenantExam.id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: { 1: 'A' } });

      // Assert
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('Not authorized');
    });

    it('should reject submission with invalid answer format', async () => {
      // Act
      const res = await request(app)
        .post(`/api/exams/${examId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: { 1: 'X' } }); // Invalid option

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Invalid answer');
    });
  });

  describe('POST /api/exams/:examId/release-result', () => {
    it('should queue WhatsApp notifications on result release', async () => {
      // Arrange
      const teacherToken = await db.getTeacherToken();
      const notificationQueueMock = jest.spyOn(app.queue, 'add');

      // Act
      const res = await request(app)
        .post(`/api/exams/${examId}/release-result`)
        .set('Authorization', `Bearer ${teacherToken}`);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(notificationQueueMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'whatsapp',
        })
      );
    });

    it('should store results before queuing notifications', async () => {
      // Arrange
      const teacherToken = await db.getTeacherToken();
      const notificationQueueMock = jest.spyOn(app.queue, 'add');

      // Act
      await request(app)
        .post(`/api/exams/${examId}/release-result`)
        .set('Authorization', `Bearer ${teacherToken}`);

      // Assert
      const results = await db.getExamResults(examId);
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(notificationQueueMock).toHaveBeenCalled();
    });
  });
});
```

### 4.4 Integration Test Checklist

- [ ] Test database setup and teardown
- [ ] Test fixtures created and used
- [ ] Full API request → response tested
- [ ] Database state verified after operation
- [ ] Multi-tenancy isolation verified (tenant_id enforcement)
- [ ] Authorization logic tested (RBAC, access control)
- [ ] Happy path tested
- [ ] Error cases tested (invalid input, forbidden access, conflicts)
- [ ] Edge cases tested (race conditions, timing issues)
- [ ] No external API calls (mocked)
- [ ] Tests run in < 10 seconds each
- [ ] Tests are independent (can run in any order)

---

## 5. End-to-End (E2E) Testing Strategy

### 5.1 E2E Test Scope

**What to E2E Test:**
- Critical user journeys (login → create exam → release result)
- Exam submission flow (Mode 1 and Mode 2)
- Result review workflow
- Multi-user scenarios (teacher + student simultaneously)
- Real UI interactions (form submission, button clicks)

**What NOT to E2E Test:**
- Error messages for every error (tested via unit/integration)
- Every permission combination (tested via unit/integration)
- Performance under load (tested via load tests)

### 5.2 E2E Test Framework

**Framework:** Playwright or Cypress

**Configuration:**
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.test.js',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
};
```

### 5.3 E2E Test Template

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Exam Mode 1 — Digital Paper + Digital OMR', () => {
  let context;
  let studentPage;
  let teacherPage;

  test.beforeAll(async () => {
    // Setup
  });

  test('Teacher creates exam and student takes it', async ({ browser }) => {
    // Arrange
    const teacherContext = await browser.newContext();
    teacherPage = await teacherContext.newPage();
    
    const studentContext = await browser.newContext();
    studentPage = await studentContext.newPage();

    // Act 1: Teacher logs in and creates exam
    await teacherPage.goto('/login');
    await teacherPage.fill('input[name="email"]', 'teacher@test.com');
    await teacherPage.fill('input[name="password"]', 'test123');
    await teacherPage.click('button:has-text("Login")');
    await teacherPage.waitForNavigation();

    // Act 2: Teacher creates exam
    await teacherPage.click('button:has-text("Create Exam")');
    await teacherPage.fill('input[name="title"]', 'Math Quiz');
    await teacherPage.fill('input[name="duration"]', '30');
    await teacherPage.click('button:has-text("Next")');

    // Act 3: Teacher adds questions
    await teacherPage.fill('textarea[name="question"]', 'What is 2+2?');
    await teacherPage.fill('input[name="optionA"]', '3');
    await teacherPage.fill('input[name="optionB"]', '4');
    await teacherPage.fill('input[name="optionC"]', '5');
    await teacherPage.fill('input[name="optionD"]', '6');
    await teacherPage.click('text=Option B'); // Select correct answer
    await teacherPage.click('button:has-text("Add Question")');

    // Act 4: Teacher publishes exam
    await teacherPage.click('button:has-text("Publish")');
    const examUrl = await teacherPage.url();
    const examId = examUrl.match(/exams\/(\d+)/)[1];

    // Act 5: Student logs in and takes exam
    await studentPage.goto('/login');
    await studentPage.fill('input[name="email"]', 'student@test.com');
    await studentPage.fill('input[name="password"]', 'test123');
    await studentPage.click('button:has-text("Login")');
    await studentPage.waitForNavigation();

    // Act 6: Student opens exam
    await studentPage.goto(`/exam/${examId}`);
    await studentPage.waitForSelector('text=Math Quiz');

    // Assert: Exam UI elements visible
    await expect(studentPage.locator('text=What is 2+2?')).toBeVisible();
    await expect(studentPage.locator('button:has-text("A")')).toBeVisible();
    await expect(studentPage.locator('button:has-text("B")')).toBeVisible();
    await expect(studentPage.locator('text=Timer')).toBeVisible();

    // Act 7: Student selects answer
    await studentPage.click('button:has-text("B")');

    // Assert: Answer selected
    const selectedBubble = studentPage.locator('button:has-text("B")').first();
    await expect(selectedBubble).toHaveClass(/selected/);

    // Act 8: Student submits exam
    await studentPage.click('button:has-text("Submit")');
    await studentPage.click('button:has-text("Confirm")');

    // Assert: Score displayed
    await expect(studentPage.locator('text=Your Score:')).toBeVisible();
    await expect(studentPage.locator('text=100%')).toBeVisible();

    // Cleanup
    await teacherContext.close();
    await studentContext.close();
  });

  test('Exam Mode 2 — Physical Paper + Digital OMR', async ({ browser }) => {
    // Similar flow but:
    // 1. Teacher selects "Physical Paper" mode
    // 2. Teacher uploads/prints PDF
    // 3. Student sees ONLY OMR grid, no questions
    // 4. Student reads physical paper and selects bubbles
  });

  test('Auto-save saves answers every 30 seconds', async ({ page }) => {
    // 1. Student takes exam
    // 2. Select an answer
    // 3. Wait 35 seconds
    // 4. Verify answer persisted to database
    // 5. Refresh page
    // 6. Verify answer still selected
  });

  test('Timer expires and auto-submits', async ({ page }) => {
    // 1. Start exam
    // 2. Wait until 1 second before expiry
    // 3. Verify submit button not clicked
    // 4. Wait 2 seconds
    // 5. Verify exam auto-submitted
    // 6. Verify results displayed
  });

  test('Result release triggers WhatsApp notification', async ({ page }) => {
    // 1. Teacher releases result
    // 2. Mock WhatsApp API
    // 3. Verify notification queued
    // 4. Wait and verify notification sent (mock API called)
  });
});
```

### 5.4 E2E Test Checklist

- [ ] Critical user journeys tested
- [ ] Multi-user interactions tested
- [ ] Real UI elements interacted with
- [ ] Database state verified (via API or inspection)
- [ ] Error handling tested (form validation, error messages)
- [ ] Mobile responsiveness tested (if applicable)
- [ ] Accessibility features tested (if applicable)
- [ ] Tests are deterministic (no timing issues)
- [ ] Screenshots/videos captured on failure
- [ ] Tests run < 60 seconds each
- [ ] Tests are independent (can run in any order)

---

## 6. Security Testing

### 6.1 Security Test Scope

**What to Test:**
- Authentication bypass attempts (invalid tokens, expired tokens)
- Authorization bypass (accessing other users' data)
- Multi-tenancy isolation (cross-tenant access)
- Exam integrity (answer key exposure, score tampering)
- Input validation (SQL injection, XSS)
- Rate limiting (brute force, DDoS)

### 6.2 Security Test Examples

```javascript
describe('Security Tests', () => {
  describe('Authentication', () => {
    it('should reject invalid JWT token', async () => {
      const res = await request(app)
        .get('/api/exams')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
    });

    it('should reject expired JWT token', async () => {
      const expiredToken = jwt.sign({ user_id: 1 }, 'secret', { expiresIn: '0s' });
      const res = await request(app)
        .get('/api/exams')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Authorization', () => {
    it('should prevent student from accessing other student exam', async () => {
      const otherStudentExam = await db.getOtherStudentExam();
      const res = await request(app)
        .get(`/api/exams/${otherStudentExam.id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should prevent teacher from releasing other teacher exam result', async () => {
      const otherTeacherExam = await db.getOtherTeacherExam();
      const res = await request(app)
        .post(`/api/exams/${otherTeacherExam.id}/release-result`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Exam Integrity', () => {
    it('should NOT expose answer key to student', async () => {
      const res = await request(app)
        .get(`/api/exams/${examId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.body).not.toHaveProperty('answer_key');
      expect(res.body).not.toHaveProperty('answers');
    });

    it('should prevent client-side score submission', async () => {
      const res = await request(app)
        .post(`/api/exams/${examId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ 
          answers: { 1: 'A' },
          score: 100, // Attempt to submit score
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.score).not.toBe(100); // Server calculated score
    });

    it('should reject submission after deadline', async () => {
      const now = new Date();
      await db.updateExam(examId, {
        started_at: new Date(now - 61 * 60 * 1000),
        duration: 60,
      });

      const res = await request(app)
        .post(`/api/exams/${examId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: { 1: 'A' } });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid answer option', async () => {
      const res = await request(app)
        .post(`/api/exams/${examId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: { 1: 'Z' } }); // Invalid

      expect(res.statusCode).toBe(400);
    });

    it('should reject SQL injection attempt', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: "' OR '1'='1",
          password: 'test',
        });

      expect(res.statusCode).toBe(401);
    });

    it('should reject XSS attempt in exam title', async () => {
      const res = await request(app)
        .post('/api/exams')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: '<script>alert("XSS")</script>',
          duration: 60,
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Multi-Tenancy Isolation', () => {
    it('should prevent accessing other institution data', async () => {
      const otherInstitution = await db.getOtherInstitution();
      const res = await request(app)
        .get(`/api/institutions/${otherInstitution.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should filter results by tenant_id in all queries', async () => {
      const res = await request(app)
        .get('/api/exams')
        .set('Authorization', `Bearer ${adminToken}`);

      const allExams = res.body;
      const otherInstitutionExams = allExams.filter(
        e => e.institution_id !== currentInstitutionId
      );

      expect(otherInstitutionExams).toHaveLength(0);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' });
      }

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'correct' });

      expect(res.statusCode).toBe(429); // Too many requests
    });
  });
});
```

---

## 7. Test Coverage Requirements

**Minimum Coverage Targets:**

| Layer | Coverage Target | Critical Paths |
|---|---|---|
| Business Logic | > 90% | 100% |
| Services | > 80% | 100% |
| Controllers | > 80% | 100% |
| Utilities | > 85% | 100% |
| React Components | > 70% | 100% |

**Critical Paths (100% coverage mandatory):**
- Score calculation engine (exact algorithm)
- Answer key protection (never exposed)
- Timer enforcement (deadline validation)
- Multi-tenancy isolation (tenant_id checks)
- RBAC authorization (permission checks)
- Exam submission validation
- Result release workflow
- WhatsApp notification queuing

**How to Measure:**
```bash
npm test -- --coverage

# Output:
# ----------|----------|----------|----------|----------|
# File      | % Stmts  | % Branch | % Funcs  | % Lines  |
# ----------|----------|----------|----------|----------|
# All files |   82.5   |   78.3   |   85.2   |   82.1   |
# ----------|----------|----------|----------|----------|
```

---

## 8. Test Execution & CI/CD

### 8.1 Test Commands

```bash
# Unit tests only
npm test -- --testPathPattern=unit

# Integration tests only
npm test -- --testPathPattern=integration

# E2E tests only
npm run test:e2e

# All tests
npm test

# Coverage report
npm test -- --coverage

# Watch mode (for development)
npm test -- --watch
```

### 8.2 CI/CD Pipeline

**GitHub Actions (.github/workflows/test.yml):**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm test -- --testPathPattern=unit --coverage
      - uses: codecov/codecov-action@v3

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- --testPathPattern=integration

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### 8.3 Pre-Commit Hooks

```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm test -- --bail --findRelatedTests
```

**No code can be committed without passing tests.**

---

## 9. Test Data Management

### 9.1 Test Fixtures

**Location:** `test/fixtures/`

```javascript
// test/fixtures/institutions.js
const institutions = [
  {
    id: 1,
    name: 'Test School',
    email: 'school@test.com',
    phone: '+919999999999',
  },
];

// test/fixtures/users.js
const users = [
  {
    id: 1,
    institution_id: 1,
    email: 'teacher@test.com',
    password: 'hashed_password',
    role: 'TEACHER',
  },
  {
    id: 2,
    institution_id: 1,
    email: 'student@test.com',
    password: 'hashed_password',
    role: 'STUDENT',
  },
];

// test/fixtures/exams.js
const exams = [
  {
    id: 1,
    institution_id: 1,
    teacher_id: 1,
    title: 'Math Quiz',
    mode: 'DIGITAL_PAPER',
    duration: 30,
    total_questions: 4,
    marks_per_correct: 4,
    marks_per_wrong: 0,
  },
];
```

### 9.2 Database Seeding

```javascript
// test/db-seed.js
async function seedTestDatabase(db) {
  const institution = await db.create('institutions', institutions[0]);
  const user = await db.create('users', users[0]);
  const exam = await db.create('exams', { ...exams[0], institution_id: institution.id });
  
  return { institution, user, exam };
}
```

---

## 10. Test Quality Standards

### 10.1 What Makes a Good Test

✅ **Good Test:**
```javascript
it('should calculate 50% when half answers are correct', () => {
  const answers = ['A', 'B', 'X', 'X'];
  const key = ['A', 'B', 'C', 'D'];
  const result = calculateScore(answers, key, { marksPerCorrect: 25 });
  expect(result.percentage).toBe(50);
});
```

❌ **Bad Test:**
```javascript
it('should work', () => {
  const result = calculateScore(['A', 'B', 'C', 'D'], ['A', 'B', 'C', 'D']);
  expect(result).toBeDefined();
});
```

### 10.2 Test Best Practices

- **One assertion per test** (or closely related assertions)
- **Clear test names** (describe what, given what, expect what)
- **No test interdependencies** (tests should run in any order)
- **Use beforeEach for setup** (not global state)
- **Mock external dependencies** (don't call real APIs)
- **Keep tests DRY** (extract common setup)
- **No timing-based assertions** (no setTimeout in tests)
- **Deterministic results** (same input = same output, always)

### 10.3 Test Review Checklist

- [ ] Test name clearly describes what is tested
- [ ] Test follows AAA pattern (Arrange, Act, Assert)
- [ ] One logical assertion per test
- [ ] No external dependencies (mocked)
- [ ] No test interdependencies
- [ ] Setup/teardown is clean
- [ ] Edge cases covered
- [ ] Error paths covered
- [ ] Test runs consistently (not flaky)
- [ ] Test completes in < 1 second (unit) or < 10 seconds (integration)

---

## 11. Testing Sign-Off

This document defines the mandatory testing protocol for EduOMR.

**No code is merged without:**
1. ✅ Unit tests passing (70% of test suite)
2. ✅ Integration tests passing (20% of test suite)
3. ✅ E2E tests passing for critical flows (10% of test suite)
4. ✅ Security tests passing (critical security paths)
5. ✅ Coverage > 80% (minimum)
6. ✅ All tests green in CI/CD
7. ✅ No flaky tests

---

## Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-13 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved after review and pyramid mapping alignment |

---

## Approval Sign-Off

**Document:** DOC 0.7 — AI Testing Prompt  
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| QA Lead | opencode | 2026-07-14 | ✅ Approved |

---

**Next:** After approval, proceed to DOC 0.8 — AI Refactoring Prompt
