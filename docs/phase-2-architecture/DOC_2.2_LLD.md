# DOC 2.2 — Low-Level Design (LLD)

**Document ID:** 2.2
**Title:** Low-Level Design — Module Specifications & Implementation Details
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Engineering
**Date:** 2026-07-14
**Purpose:** Define the detailed low-level design for every module — class/function signatures, algorithms, data structures, and implementation patterns.

---

## 1. Module: Auth

### 1.1 Files

| File | Purpose |
|---|---|
| `auth.controller.js` | Route handlers for login, refresh, logout, password reset |
| `auth.service.js` | Authentication business logic |
| `auth.repository.js` | User lookup, token persistence |
| `auth.schema.js` | Zod schemas for auth endpoints |

### 1.2 Controller Functions

```javascript
// POST /api/v1/auth/login
async function login(req, res, next) {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.login(email, password);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true, secure: true, sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/v1/auth'
  });
  return res.status(200).json(successResponse({
    accessToken: result.accessToken,
    user: result.user
  }));
}

// POST /api/v1/auth/refresh
async function refresh(req, res, next) {
  const token = req.cookies.refreshToken;
  const result = await authService.refresh(token);
  res.cookie('refreshToken', result.refreshToken, { /* same config */ });
  return res.status(200).json(successResponse({ accessToken: result.accessToken }));
}

// POST /api/v1/auth/logout
async function logout(req, res, next) {
  const token = req.cookies.refreshToken;
  await authService.logout(token);
  res.clearCookie('refreshToken');
  return res.status(200).json(successResponse(null));
}

// POST /api/v1/auth/forgot-password
async function forgotPassword(req, res, next) {
  const { email } = forgotPasswordSchema.parse(req.body);
  await authService.forgotPassword(email);
  return res.status(200).json(successResponse({ message: 'If email exists, reset link sent.' }));
}

// POST /api/v1/auth/reset-password
async function resetPassword(req, res, next) {
  const { token, password } = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(token, password);
  return res.status(200).json(successResponse({ message: 'Password reset successful.' }));
}
```

### 1.3 Service Functions

```javascript
class AuthService {
  async login(email, password) { /* ... */ }
  async refresh(refreshToken) { /* ... */ }
  async logout(refreshToken) { /* ... */ }
  async forgotPassword(email) { /* ... */ }
  async resetPassword(token, password) { /* ... */ }
}
```

**login algorithm:**
1. Find user by email (case-insensitive)
2. If not found → throw AuthenticationError
3. Compare password with bcrypt
4. If mismatch → increment failed_attempts; if >= 10 → lock account; throw AuthenticationError
5. Check institution status is active
6. Check subscription is active (if required)
7. Generate access token (jwt.sign, 15 min, payload: { userId, tenantId, role, email })
8. Generate refresh token (jwt.sign, 7 days, payload: { userId, tokenId })
9. Store refresh token hash in database
10. Return { accessToken, refreshToken, user: { id, name, email, role } }

### 1.4 Token Management

| Token | Algorithm | Secret | Expiry | Storage |
|---|---|---|---|---|
| Access | HS256 | ACCESS_TOKEN_SECRET | 15 min | Client (memory/http header) |
| Refresh | HS256 | REFRESH_TOKEN_SECRET | 7 days | httpOnly cookie + DB whitelist |

### 1.5 Password Reset Token

```javascript
const resetToken = crypto.randomBytes(32).toString('hex');
const resetHash = crypto.createHash('sha256').update(resetToken).digest('hex');
// Store resetHash + userId + expiry in DB
// Send email with resetToken (not hash)
// On reset: compare hash, check expiry < 1 hour
```

---

## 2. Module: Institution

### 2.1 Key Functions

```javascript
class InstitutionService {
  async create(data) {
    // Validate all fields
    // Check name uniqueness
    // Create institution (status: pending)
    // Generate admin password
    // Create admin user
    // Send welcome email
    return institution;
  }

  async getById(id) { /* repository lookup */ }
  async list(filters) { /* with pagination */ }
  async update(id, data) { /* update fields */ }
  async updateStatus(id, status) { /* enable/disable */ }
}
```

---

## 3. Module: Subscription

### 3.1 Key Functions

```javascript
class SubscriptionService {
  async createPlan(data) { /* Super Admin creates plan */ }
  async listPlans() { /* active plans only */ }

  async uploadPayment(adminId, planId, utr, amount, screenshotFile) {
    // Validate UTR uniqueness
    // Store file to S3
    // Create payment_upload (status: pending)
    // Notify Super Admin
  }

  async verifyPayment(superAdminId, paymentUploadId, action) {
    // Validate payment exists and is pending
    // If action = verify:
    //   Create subscription (start_date = now, end_date = now + plan.duration)
    //   Update institution status to active
    //   Notify admin
    // If action = reject:
    //   Update payment status to rejected
    //   Notify admin with reason
  }

  async checkSubscription(tenantId) {
    // Find active subscription where now BETWEEN start_date AND end_date
    // Cache result for 30 min
    // If none found → throw SubscriptionExpiredError
  }
}
```

---

## 4. Module: User

### 4.1 Key Functions

```javascript
class UserService {
  async create(tenantId, data) {
    // Validate email uniqueness within tenant
    // Generate initial password
    // Create user with bcrypt hash
    // If parent: accept linkedStudentIds
    // Create parent_student links
    // Return user (without password)
  }

  async bulkCreate(tenantId, csvData) {
    // Parse CSV
    // Validate per row
    // Batch insert valid rows
    // Return success + error rows
  }

  async linkParent(tenantId, parentId, studentIds) {
    // Validate parent not at max (5 students)
    // Validate students belong to same tenant
    // Create links
  }
}
```

---

## 5. Module: Exam

### 5.1 Key Functions

```javascript
class ExamService {
  async create(tenantId, teacherId, data) {
    // Create exam record (status: draft)
    // If questions provided: create questions with sequential numbering
    // If answer key provided: store (server-side only)
    return exam;
  }

  async publish(tenantId, examId) {
    // Validate exam has questions
    // Validate exam has answer key
    // Validate exam has class assignment
    // Update status to published
  }

  async getExamForMode1(tenantId, examId) {
    // Return exam with questions (no answer key)
    // Only for DIGITAL mode exams
  }

  async getExamForMode2(tenantId, examId) {
    // Return exam WITHOUT questions
    // Include instruction banner
    // Only for PHYSICAL_PAPER mode exams
  }
}
```

---

## 6. Module: Exam Session

### 6.1 Session Lifecycle

```
START → in_progress → submitted (manual) → DONE
                      → auto_submitted    → DONE
                      → expired           → DONE
```

### 6.2 Key Functions

```javascript
class ExamSessionService {
  async startSession(tenantId, studentId, examId) {
    // Validate exam published
    // Validate within scheduled window
    // Validate no existing session
    // Calculate deadline = MIN(now + duration, exam.deadline_at)
    // Create session (status: in_progress)
    // Return sessionId, deadline
  }

  async getSessionStatus(sessionId) {
    // Get session
    // Calculate remaining seconds
    // If deadline passed and status = in_progress → trigger auto-submit
    // Return status + remaining seconds
  }
}
```

### 6.3 Timer Enforcement

```javascript
function isDeadlinePassed(session) {
  const deadline = new Date(session.started_at.getTime() + session.duration_minutes * 60000);
  return new Date() > deadline;
}

// Called on every save and submit
function validateDeadline(session) {
  if (isDeadlinePassed(session)) {
    throw new ExamTimeExpiredError('Exam time has expired.');
  }
}
```

---

## 7. Module: Submission (Auto-Save & Submit)

### 7.1 Auto-Save Algorithm

```javascript
class SubmissionService {
  async saveAnswers(tenantId, sessionId, answers) {
    // 1. Validate session belongs to tenant
    const session = await examSessionRepository.findById(sessionId);
    if (session.tenant_id !== tenantId) throw new ForbiddenError();
    if (session.status !== 'in_progress') throw new BadRequestError('Session not in progress.');

    // 2. Validate deadline not passed
    validateDeadline(session);

    // 3. Upsert each answer
    for (const answer of answers) {
      await submissionRepository.upsert({
        exam_session_id: sessionId,
        question_id: answer.questionId,
        selected_option: answer.selectedOption || null,
        is_saved: true,
        saved_at: new Date()
      });
    }

    return { saved: true, savedAt: new Date().toISOString() };
  }

  async submitExam(tenantId, sessionId) {
    // 1. Validate session
    const session = await examSessionRepository.findById(sessionId);
    if (session.tenant_id !== tenantId) throw new ForbiddenError();
    if (session.status !== 'in_progress') throw new BadRequestError('Already submitted.');

    // 2. Save pending answers (failsafe)
    // 3. Check deadline one final time
    // 4. Update session status to submitted
    await examSessionRepository.update(sessionId, {
      status: 'submitted',
      submitted_at: new Date()
    });

    // 5. Queue score calculation
    await evaluationQueue.add({ sessionId, type: 'evaluate' });

    return { success: true };
  }
}
```

### 7.2 Auto-Submit Job

```javascript
// Bull job scheduled at exam deadline
async function autoSubmitExam(examId) {
  const sessions = await examSessionRepository.findInProgressByExam(examId);
  for (const session of sessions) {
    await examSessionRepository.update(session.id, {
      status: 'auto_submitted',
      submitted_at: new Date(exam.deadline_at)
    });
    await evaluationQueue.add({ sessionId: session.id, type: 'evaluate' });
  }
  logger.info(`Auto-submitted ${sessions.length} sessions for exam ${examId}`);
}
```

---

## 8. Score Calculation Engine

### 8.1 Algorithm

```javascript
class ScoreCalculationService {
  async calculate(sessionId) {
    const session = await examSessionRepository.findById(sessionId);
    const exam = await examRepository.findById(session.exam_id);
    const answers = await submissionRepository.findBySession(sessionId);
    const answerKey = await answerKeyRepository.findByExam(exam.id);

    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    const questionResults = [];

    for (const entry of answerKey.entries) {
      const studentAnswer = answers.find(a => a.question_id === entry.question_id);
      const selected = studentAnswer?.selected_option || null;

      if (selected === null) {
        skippedCount++;
        questionResults.push({
          question_id: entry.question_id,
          student_answer: null,
          correct_answer: entry.correct_option,
          is_correct: false,
          marks_awarded: 0
        });
      } else if (selected === entry.correct_option) {
        correctCount++;
        totalScore += exam.marks_per_correct;
        questionResults.push({
          question_id: entry.question_id,
          student_answer: selected,
          correct_answer: entry.correct_option,
          is_correct: true,
          marks_awarded: exam.marks_per_correct
        });
      } else {
        wrongCount++;
        if (exam.negative_marking) {
          totalScore -= exam.marks_per_wrong;
        }
        questionResults.push({
          question_id: entry.question_id,
          student_answer: selected,
          correct_answer: entry.correct_option,
          is_correct: false,
          marks_awarded: -(exam.negative_marking ? exam.marks_per_wrong : 0)
        });
      }
    }

    totalScore = Math.max(totalScore, 0);
    const percentage = Math.round((totalScore / exam.total_marks) * 100 * 100) / 100;

    // Create result
    const result = await resultRepository.create({
      exam_session_id: sessionId,
      exam_id: exam.id,
      student_id: session.student_id,
      tenant_id: session.tenant_id,
      total_score: totalScore,
      total_marks: exam.total_marks,
      correct_count: correctCount,
      wrong_count: wrongCount,
      skipped_count: skippedCount,
      percentage: percentage,
      is_released: false
    });

    // Create question results
    await questionResultRepository.createBulk(
      questionResults.map(qr => ({ ...qr, result_id: result.id, tenant_id: session.tenant_id }))
    );

    // Queue rank calculation
    await evaluationQueue.add({ examId: exam.id, type: 'rank' });

    return result;
  }

  async calculateRank(examId) {
    const results = await resultRepository.findByExamOrderedByPercentage(examId);
    let currentRank = 0;
    let previousPercentage = null;

    for (let i = 0; i < results.length; i++) {
      if (results[i].percentage !== previousPercentage) {
        currentRank = i + 1;
        previousPercentage = results[i].percentage;
      }
      await resultRepository.update(results[i].id, {
        rank: currentRank,
        total_students: results.length
      });
    }
  }
}
```

---

## 9. Module: Notification

### 9.1 WhatsApp Service

```javascript
class WhatsAppService {
  constructor() {
    this.baseUrl = `https://graph.facebook.com/v19.0/${process.env.WA_PHONE_NUMBER_ID}/messages`;
    this.token = process.env.WA_ACCESS_TOKEN;
  }

  async send(parentPhone, templateParams) {
    const response = await axios.post(this.baseUrl, {
      messaging_product: 'whatsapp',
      to: parentPhone,
      type: 'template',
      template: {
        name: 'exam_result',
        language: { code: 'en' },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: templateParams.parentName },
            { type: 'text', text: templateParams.studentName },
            { type: 'text', text: String(templateParams.score) },
            { type: 'text', text: String(templateParams.totalMarks) },
            { type: 'text', text: templateParams.examTitle },
            { type: 'text', text: String(templateParams.rank) },
            { type: 'text', text: String(templateParams.totalStudents) }
          ]
        }]
      }
    }, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }
}
```

### 9.2 Notification Worker

```javascript
// Bull worker for notification queue
const notificationWorker = new Worker('notification', async (job) => {
  const { parentId, parentPhone, parentEmail, studentName, score, totalMarks,
          examTitle, rank, totalStudents, examId, studentId, tenantId } = job.data;

  const logEntry = {
    tenant_id: tenantId, exam_id: examId, student_id: studentId,
    parent_id: parentId, channel: 'whatsapp', status: 'queued',
    max_retries: 3, attempt_number: job.attemptsMade + 1
  };

  try {
    await whatsappService.send(parentPhone, {
      parentName: 'Parent', studentName, score, totalMarks,
      examTitle, rank, totalStudents
    });
    logEntry.status = 'sent';
    logEntry.sent_at = new Date();
    await notificationLogRepository.create(logEntry);
  } catch (error) {
    logEntry.status = 'failed';
    logEntry.error_message = error.message;
    await notificationLogRepository.create(logEntry);

    if (job.attemptsMade < 3) {
      throw error; // Bull retries
    }

    // 3rd failure → email fallback
    try {
      await emailService.send(parentEmail, 'Exam Result', buildEmailBody({/*...*/}));
      logEntry.status = 'sent';
      logEntry.channel = 'email';
      await notificationLogRepository.create(logEntry);
    } catch (emailError) {
      logEntry.status = 'dead_letter';
      logEntry.error_message = emailError.message;
      await notificationLogRepository.create(logEntry);
    }
  }
}, { concurrency: 10, maxRetries: 3, backoff: { type: 'exponential', delay: 2000 } });
```

---

## 10. Middleware Specifications

### 10.1 Auth Middleware

```javascript
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json(errorResponse({ code: 'UNAUTHORIZED', message: 'No token provided' }));
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(errorResponse({ code: 'TOKEN_EXPIRED', message: 'Token expired' }));
    }
    return res.status(401).json(errorResponse({ code: 'INVALID_TOKEN', message: 'Invalid token' }));
  }
}
```

### 10.2 RBAC Middleware

```javascript
function rbacMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json(errorResponse({ code: 'FORBIDDEN', message: 'Insufficient permissions' }));
    }
    next();
  };
}
// Usage: rbacMiddleware('admin', 'teacher')
```

### 10.3 Tenant Middleware

```javascript
function tenantMiddleware(req, res, next) {
  req.tenantId = req.user.tenantId; // From JWT — NEVER from request body/params
  next();
}
```

### 10.4 Subscription Guard

```javascript
async function subscriptionGuard(req, res, next) {
  const tenantId = req.tenantId;
  const cacheKey = `sub:${tenantId}:active`;
  let hasActive = await redis.get(cacheKey);

  if (hasActive === null) {
    hasActive = await subscriptionRepository.hasActive(tenantId);
    await redis.set(cacheKey, hasActive ? '1' : '0', 'EX', 1800);
  }

  if (hasActive !== '1') {
    return res.status(402).json(errorResponse({ code: 'SUBSCRIPTION_EXPIRED', message: 'Active subscription required.' }));
  }
  next();
}
```

---

## 11. Error Handling

### 11.1 Custom Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class ExamTimeExpiredError extends AppError {
  constructor(message = 'Exam time has expired') {
    super(message, 422, 'EXAM_TIME_EXPIRED');
  }
}

class SubscriptionExpiredError extends AppError {
  constructor(message = 'Active subscription required') {
    super(message, 402, 'SUBSCRIPTION_EXPIRED');
  }
}
```

### 11.2 Global Error Handler

```javascript
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.isOperational ? err.message : 'An unexpected error occurred';

  logger.error(`${code}: ${err.message}`, {
    requestId: req.requestId,
    userId: req.user?.userId,
    tenantId: req.tenantId,
    stack: err.stack,
    statusCode
  });

  return res.status(statusCode).json(errorResponse({
    code,
    message,
    details: err.details || null,
    requestId: req.requestId
  }));
}
```

---

## 12. Validation (Zod Schemas)

### 12.1 Auth Schemas

```javascript
const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128)
});

const forgotPasswordSchema = z.object({
  email: z.string().email().max(255)
});

const resetPasswordSchema = z.object({
  token: z.string().length(64),
  password: z.string().min(6).max(128)
});
```

### 12.2 Exam Schemas

```javascript
const createExamSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  exam_mode: z.enum(['DIGITAL', 'PHYSICAL_PAPER']),
  total_marks: z.number().int().min(1).max(1000),
  marks_per_correct: z.number().positive().max(100),
  marks_per_wrong: z.number().min(0).max(100).default(0),
  negative_marking: z.boolean().default(false),
  duration_minutes: z.number().int().min(1).max(480),
  scheduled_at: z.string().datetime(),
  deadline_at: z.string().datetime(),
  class_id: z.string().uuid(),
  subject_id: z.string().uuid()
});

const saveAnswersSchema = z.object({
  answers: z.array(z.object({
    question_number: z.number().int().min(1),
    selected_option: z.string().length(1).regex(/^[A-D]$/).nullable()
  }))
});
```

---

## 13. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 14. Approval Sign-Off

**Document:** DOC 2.2 — Low-Level Design
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-14 | ✅ Approved |
