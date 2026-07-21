# DOC 2.4 — API Design

**Document ID:** 2.4
**Title:** API Design — RESTful Endpoints, Request/Response Contracts & API Architecture
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Engineering
**Date:** 2026-07-15
**Purpose:** Define the complete RESTful API surface — endpoint contracts, request/response shapes, status codes, authentication, rate limiting, and versioning strategy.

---

## 1. API Design Principles

| Principle | Guideline |
|---|---|
| Style | RESTful — resources as nouns, HTTP verbs for actions |
| Base URL | `/api/v1/` |
| Protocol | HTTPS only |
| Auth | JWT Bearer token (Authorization header) |
| Content-Type | `application/json` for requests and responses |
| Pagination | Cursor-based for list endpoints |
| Versioning | URL path prefix (`/api/v1/`) |
| Rate Limits | 100 req/min per tenant key, 1000 req/min per IP |
| Idempotency | PUT and DELETE are idempotent |
| Date Format | ISO 8601 UTC |
| UUID | All resource IDs are UUID v4 |

---

## 2. Standard Response Envelope

### 2.1 Success Response

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-07-15T10:00:00.000Z"
  }
}
```

### 2.2 Paginated Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-07-15T10:00:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2.3 Error Response

```json
{
  "success": false,
  "error": {
    "code": "EXAM_NOT_FOUND",
    "message": "Exam with ID xyz not found",
    "details": {},
    "timestamp": "2026-07-15T10:00:00.000Z",
    "requestId": "req_abc123"
  }
}
```

### 2.4 HTTP Status Codes

| Code | Meaning | When |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failure, malformed input |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Insufficient role permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource, state conflict |
| 422 | Unprocessable Entity | Business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## 3. Authentication Endpoints

### 3.1 POST /api/v1/auth/register

Register a new institution (initially creates institution + admin user).

**Request:**
```json
{
  "institutionName": "Springfield High School",
  "adminEmail": "admin@springfield.edu",
  "adminPassword": "SecurePass123!",
  "adminFirstName": "John",
  "adminLastName": "Doe",
  "contactPhone": "+919876543210"
}
```

**Validation (Zod):**
- institutionName: string 2-255 chars
- adminEmail: valid email format
- adminPassword: min 8, 1 uppercase, 1 lowercase, 1 digit, 1 special
- adminFirstName: string 1-100 chars
- adminLastName: string 0-100 (optional)
- contactPhone: valid Indian phone (optional)

**Response 201:**
```json
{
  "success": true,
  "data": {
    "institutionId": "uuid",
    "userId": "uuid",
    "message": "Institution registered. Awaiting subscription activation."
  }
}
```

### 3.2 POST /api/v1/auth/login

**Request:**
```json
{
  "email": "admin@springfield.edu",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "dGhpcyBp...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "admin@springfield.edu",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "tenantId": "uuid"
    }
  }
}
```

### 3.3 POST /api/v1/auth/refresh

**Request:**
```json
{
  "refreshToken": "dGhpcyBp..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_eyJhbG...",
    "refreshToken": "new_dGhpcyBp...",
    "expiresIn": 900
  }
}
```

### 3.4 POST /api/v1/auth/logout

**Headers:** Authorization: Bearer <accessToken>
**Request:**
```json
{
  "refreshToken": "dGhpcyBp..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### 3.5 POST /api/v1/auth/forgot-password

**Request:**
```json
{
  "email": "admin@springfield.edu"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Password reset link sent to email"
  }
}
```

### 3.6 POST /api/v1/auth/reset-password

**Request:**
```json
{
  "token": "reset_token_string",
  "password": "NewSecurePass456!"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

## 4. Institution Endpoints

### 4.1 GET /api/v1/institutions
Super Admin only. Returns all institutions.

### 4.2 GET /api/v1/institutions/:id
Super Admin only. Returns single institution details.

### 4.3 PATCH /api/v1/institutions/:id
Super Admin only. Update institution name, status, settings.

### 4.4 DELETE /api/v1/institutions/:id
Super Admin only. Soft-delete.

---

## 5. Subscription Endpoints

### 5.1 GET /api/v1/plans
Public. List all active subscription plans.

### 5.2 POST /api/v1/payments/upload
Institution Admin only. Upload payment screenshot + UTR.

**Request (multipart/form-data):**
```
screenshot: <file>
utrNumber: "ABC123456789"
planId: "uuid"
amount: 5000.00
```

### 5.3 GET /api/v1/payments
Institution Admin: See own payments. Super Admin: See all.

### 5.4 PATCH /api/v1/payments/:id/verify
Super Admin only. Verify or reject payment.

**Request:**
```json
{
  "status": "verified",
  "rejectionReason": null
}
```

### 5.5 GET /api/v1/subscriptions
Institution Admin: Get current subscription status.

---

## 6. User Management Endpoints

### 6.1 POST /api/v1/users
Institution Admin / Super Admin. Create user (teacher, student, parent).

**Request:**
```json
{
  "email": "teacher@springfield.edu",
  "password": "TempPass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+919876543211",
  "role": "teacher"
}
```

### 6.2 GET /api/v1/users
List users. Filter by role, status, search query. Paginated.

### 6.3 GET /api/v1/users/:id
Single user details.

### 6.4 PATCH /api/v1/users/:id
Update user details. Cannot change role after creation.

### 6.5 DELETE /api/v1/users/:id
Soft-delete user.

### 6.6 POST /api/v1/users/:id/link-parent
Link parent to student(s).

**Request:**
```json
{
  "studentIds": ["uuid1", "uuid2"]
}
```

### 6.7 GET /api/v1/users/me
Returns current user profile.

---

## 7. Academic Structure Endpoints

### 7.1 POST /api/v1/academic-years
**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "2026-2027",
    "startDate": "2026-04-01",
    "endDate": "2027-03-31"
  }
}
```

### 7.2 POST /api/v1/classes
### 7.3 GET /api/v1/classes
### 7.4 POST /api/v1/sections
### 7.5 GET /api/v1/sections?classId=uuid
### 7.6 POST /api/v1/subjects
### 7.7 GET /api/v1/subjects?classId=uuid
### 7.8 POST /api/v1/enrollments
Bulk enroll students.

**Request:**
```json
{
  "studentIds": ["uuid1", "uuid2", "uuid3"],
  "classId": "uuid",
  "sectionId": "uuid",
  "academicYearId": "uuid"
}
```

---

## 8. Exam Module Endpoints

### 8.1 POST /api/v1/exams
Teacher creates exam.

**Request:**
```json
{
  "title": "Midterm Mathematics",
  "description": "Chapters 1-5",
  "examMode": "DIGITAL",
  "totalMarks": 100,
  "marksPerCorrect": 4.0,
  "marksPerWrong": 1.0,
  "negativeMarking": true,
  "durationMinutes": 90,
  "scheduledAt": "2026-08-15T09:00:00Z",
  "deadlineAt": "2026-08-15T10:30:00Z",
  "classId": "uuid",
  "subjectId": "uuid"
}
```

### 8.2 GET /api/v1/exams
List exams. Filter by status, class, subject. Paginated.

### 8.3 GET /api/v1/exams/:id
Single exam details. Questions NOT included in response (answer key protection).

### 8.4 PATCH /api/v1/exams/:id
Update exam (only while in draft status).

### 8.5 DELETE /api/v1/exams/:id
Soft-delete.

### 8.6 POST /api/v1/exams/:id/questions
Bulk create questions.

**Request:**
```json
{
  "questions": [
    {
      "questionText": "What is 2 + 2?",
      "options": {"A": "3", "B": "4", "C": "5", "D": "6"},
      "correctOption": "B",
      "marks": 4.0,
      "orderIndex": 1
    }
  ]
}
```

### 8.7 GET /api/v1/exams/:id/questions
Teacher only. Returns questions with correct answers.

### 8.8 PUT /api/v1/exams/:id/questions/:questionId
Update single question.

### 8.9 DELETE /api/v1/exams/:id/questions/:questionId
Remove question. Adjusts order_index for remaining questions.

### 8.10 POST /api/v1/exams/:id/answer-key
Upload or update answer key.

**Request:**
```json
{
  "entries": [
    {"questionNumber": 1, "correctOption": "B"},
    {"questionNumber": 2, "correctOption": "A"}
  ]
}
```

### 8.11 POST /api/v1/exams/:id/publish
Change status from draft to published. Validates:
- At least 1 question (Mode 1) or answer key present (Mode 2)
- scheduled_at is in the future
- duration_minutes > 0

### 8.12 POST /api/v1/exams/:id/print
Institution Admin / Teacher. Generates question paper PDF for Mode 2.

---

## 9. Exam Session Endpoints

### 9.1 POST /api/v1/exams/:id/start
Student starts exam session.

**Response 201:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "examTitle": "Midterm Mathematics",
    "durationMinutes": 90,
    "deadlineAt": "2026-08-15T10:30:00Z",
    "questions": [
      {
        "id": "uuid",
        "questionText": "What is 2 + 2?",
        "options": {"A": "3", "B": "4", "C": "5", "D": "6"},
        "orderIndex": 1
      }
    ],
    "totalQuestions": 25
  }
}
```

**Mode 2 Response** (questions array excluded):
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "examTitle": "Midterm Physics",
    "durationMinutes": 90,
    "deadlineAt": "2026-08-15T10:30:00Z",
    "questions": [],
    "totalQuestions": 25,
    "bannerText": "Answer according to your physical question paper"
  }
}
```

### 9.2 POST /api/v1/sessions/:sessionId/answers
Auto-save single answer.

**Request:**
```json
{
  "questionId": "uuid",
  "selectedOption": "B"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Answer saved",
    "savedAt": "2026-08-15T09:05:00.000Z"
  }
}
```

### 9.3 POST /api/v1/sessions/:sessionId/submit
Manual submit.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Exam submitted successfully",
    "submittedAt": "2026-08-15T10:15:00.000Z"
  }
}
```

### 9.4 GET /api/v1/sessions/:sessionId
Get session state (current answers, time remaining).

### 9.5 GET /api/v1/exams/:id/students
Teacher live monitor — list all student sessions with status.

---

## 10. Result Endpoints

### 10.1 GET /api/v1/sessions/:sessionId/result
Student: Get own result. Teacher: Get any session result.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalScore": 84.0,
    "totalMarks": 100.0,
    "percentage": 84.0,
    "correctCount": 21,
    "wrongCount": 4,
    "skippedCount": 0,
    "rank": 3,
    "totalStudents": 120,
    "perQuestion": [
      {
        "questionNumber": 1,
        "studentAnswer": "B",
        "correctAnswer": "B",
        "isCorrect": true,
        "marksAwarded": 4.0
      }
    ]
  }
}
```

### 10.2 POST /api/v1/exams/:id/release-results
Teacher only. Releases all results for exam. Triggers WhatsApp notifications.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Results released. Notifications queued.",
    "resultsCount": 45,
    "notificationJobId": "bull_job_id"
  }
}
```

### 10.3 GET /api/v1/exams/:id/leaderboard
Top 10 students by percentage.

### 10.4 GET /api/v1/exams/:id/analytics
Teacher dashboard data:
- Average score
- Highest/Lowest score
- Per-question difficulty (how many got each question right/wrong)
- Submission time histogram

---

## 11. Notification Endpoints

### 11.1 GET /api/v1/notifications
List notification logs for an exam. Paginated.

### 11.2 POST /api/v1/notifications/resend
Retry failed notifications.

---

## 12. Exam Integrity Enforcement

### 12.1 Server-Side Deadline Validation

Every POST /api/v1/sessions/:sessionId/answers request:
```javascript
const session = await prisma.examSession.findUnique({
  where: { id: sessionId },
  include: { exam: true }
});

if (session.status !== 'in_progress') {
  throw new ExamError('Session is not in progress');
}

const now = new Date();
const deadline = new Date(session.exam.deadlineAt);
if (now > deadline) {
  // Auto-submit
  await submitSession(session);
  throw new ExamError('Exam deadline has passed. Session auto-submitted.');
}
```

### 12.2 Answer Key Protection

- `/api/v1/exams/:id` — does NOT include `questions` or `answer_key`
- `/api/v1/exams/:id/questions` — requires teacher/admin role
- Answer key endpoint requires teacher/admin role
- Score calculation runs server-only via `/api/v1/sessions/:sessionId/submit`

### 12.3 Rate Limits

| Endpoint Group | Limit | Window |
|---|---|---|
| Login, Refresh | 10 req/min | Per IP |
| Auto-save answers | 60 req/min | Per session |
| Read endpoints | 100 req/min | Per tenant |
| Write endpoints | 50 req/min | Per tenant |

---

## 13. API Security Headers

Every response includes:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
X-XSS-Protection: 1; mode=block
```

---

## 14. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-15 | Approved | Approved by Founder |

---

## 15. Approval Sign-Off

**Document:** DOC 2.4 — API Design
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-15 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-15 | ✅ Approved |
