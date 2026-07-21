# DOC 1.3 — Technical Requirements Document (TRD)

**Document ID:** 1.3
**Title:** Technical Requirements Document — EduOMR System Specifications
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Engineering
**Date:** 2026-07-14
**Purpose:** Define the technical architecture, system specifications, technology choices, infrastructure, API contracts, and data model requirements for EduOMR.

---

## 1. System Architecture Overview

EduOMR follows a **modular monolith** architecture for MVP, designed to be extracted into microservices when scale demands it.

### 1.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Load Balancer                         │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                App Server (Stateless)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Auth    │ │Institution│ │  Exam    │ │  Result  │   │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  User    │ │Academic  │ │Notification│Subscription│  │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└────────────────────┬─────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│PostgreSQL│  │  Redis   │  │  External     │
│ (Primary)│  │(Cache+Q) │  │  APIs         │
└──────────┘  └──────────┘  │ • Meta WA     │
                            │ • SendGrid    │
                            └──────────────┘
```

### 1.2 Layer Architecture (Per Module)

```
Controller (HTTP) → Service (Business Logic) → Repository (Data Access) → Prisma (ORM) → PostgreSQL
                                                      ↕
                                                 Redis Cache
```

### 1.3 Request Flow

```
Client → HTTPS → Load Balancer → Express Middleware Stack:
  1. Request ID (uuid)
  2. Rate Limiter
  3. JWT Auth (verify access token)
  4. RBAC (verify role permission)
  5. Tenant (extract tenant_id from JWT)
  6. Zod Validation (parse + validate body/params/query)
  7. Controller → Service → Repository → Prisma → DB
  8. Response Utility → Client
```

---

## 2. Technology Stack (Locked)

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Runtime | Node.js | LTS (20.x) | Async I/O for concurrent exam sessions |
| Framework | Express.js | 4.x | Mature, stable, well-understood |
| Language | JavaScript ES2022+ | Strict mode | Team familiarity, no TypeScript overhead for MVP |
| Database | PostgreSQL | 16.x | ACID compliance, JSON support, robust |
| ORM | Prisma | 5.x | Type-safe queries, migrations, multi-tenant support |
| Cache | Redis | 7.x | Sub-millisecond reads, session store, rate limiting |
| Queue | Bull | 4.x | Redis-backed, persistent, retry, delayed jobs |
| Auth | JWT (jsonwebtoken) | 9.x | Stateless, no session store needed |
| Password | bcrypt | 5.x | 12 rounds, industry standard |
| Validation | Zod | 3.x | Schema validation, TypeScript inference capable |
| Logging | Winston | 3.x | Structured, multi-transport |
| Testing | Jest + Supertest | Latest | Unit + integration, no additional framework |
| PDF | Puppeteer | Latest | Headless Chrome for question paper generation |
| WhatsApp | Meta Cloud API | v19.0+ | Official, reliable, scalable |
| Email | Nodemailer → SendGrid | Latest | Transactional email delivery |
| Frontend | React 18 + Vite | Latest | Modern, fast dev experience |
| UI | Tailwind CSS + shadcn/ui | Latest | Utility-first, accessible components |
| State | Zustand | 4.x | Lightweight, no boilerplate |
| HTTP | Axios | 1.x | Promise-based, interceptor support |

---

## 3. API Architecture

### 3.1 Base URL Convention

```
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{action}
```

### 3.2 API Versioning

- All endpoints prefixed with `/api/v1/`
- Version increment on breaking changes
- Old versions deprecated with migration window

### 3.3 Response Shape

```json
// Success (single)
{ "success": true, "data": {}, "meta": { "requestId": "req_xxx", "timestamp": "ISO-8601" } }

// Success (list)
{ "success": true, "data": [], "meta": {
    "requestId": "req_xxx",
    "timestamp": "ISO-8601",
    "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8, "hasNext": true, "hasPrev": false }
  }
}

// Error
{ "success": false, "error": {
    "code": "EXAM_NOT_FOUND",
    "message": "Human readable message",
    "details": {},
    "timestamp": "ISO-8601",
    "requestId": "req_xxx"
  }
}
```

### 3.4 HTTP Status Code Conventions

| Code | Usage |
|---|---|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (duplicate, state conflict) |
| 422 | Unprocessable Entity (business rule violation) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

### 3.5 Endpoint Summary (MVP)

#### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/auth/login | Login with email + password |
| POST | /api/v1/auth/refresh | Refresh access token |
| POST | /api/v1/auth/logout | Invalidate refresh token |
| POST | /api/v1/auth/forgot-password | Send reset email |
| POST | /api/v1/auth/reset-password | Reset password with token |

#### Institutions (Super Admin only)
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/institutions | Create institution |
| GET | /api/v1/institutions | List institutions |
| GET | /api/v1/institutions/:id | Get institution |
| PUT | /api/v1/institutions/:id | Update institution |
| PATCH | /api/v1/institutions/:id/status | Enable/disable |

#### Subscriptions
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/subscriptions/plans | Create plan (Super Admin) |
| GET | /api/v1/subscriptions/plans | List plans |
| POST | /api/v1/subscriptions/payment-upload | Upload payment proof (Admin) |
| POST | /api/v1/subscriptions/verify | Verify + activate (Super Admin) |
| GET | /api/v1/subscriptions/status | Current subscription status |

#### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/users | Create user (Admin) |
| POST | /api/v1/users/bulk | Bulk create users |
| GET | /api/v1/users | List users (filtered by role) |
| GET | /api/v1/users/:id | Get user |
| PUT | /api/v1/users/:id | Update user |
| DELETE | /api/v1/users/:id | Soft delete user |

#### Academic
| Method | Endpoint | Description |
|---|---|---|
| CRUD | /api/v1/academic-years | Academic year management |
| CRUD | /api/v1/classes | Class management |
| CRUD | /api/v1/sections | Section management |
| CRUD | /api/v1/subjects | Subject management |
| POST | /api/v1/enrollments | Enroll student in class |

#### Exams
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/exams | Create exam |
| GET | /api/v1/exams | List exams |
| GET | /api/v1/exams/:id | Get exam details |
| PUT | /api/v1/exams/:id | Update exam |
| DELETE | /api/v1/exams/:id | Delete exam (soft) |
| POST | /api/v1/exams/:id/publish | Publish exam |
| POST | /api/v1/exams/:id/questions | Bulk upload questions |
| POST | /api/v1/exams/:id/answer-key | Upload answer key |

#### Exam Session (Student)
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/exam-sessions/start | Start exam session |
| GET | /api/v1/exam-sessions/:id/mode1 | Get questions + OMR (Mode 1) |
| GET | /api/v1/exam-sessions/:id/mode2 | Get OMR only (Mode 2) |
| POST | /api/v1/exam-sessions/:id/save | Auto-save answers |
| POST | /api/v1/exam-sessions/:id/submit | Manual submit |
| GET | /api/v1/exam-sessions/:id/status | Session status + remaining time |

#### Results
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/exams/:id/release-result | Release results + trigger notifications |
| GET | /api/v1/results/my | Current user's results |
| GET | /api/v1/results/student/:id | Student result (parent view) |
| GET | /api/v1/results/:id/breakdown | Per-question breakdown |

#### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/notifications/logs | Notification history (Admin) |
| GET | /api/v1/notifications/logs/:id | Notification details |

---

## 4. Database Architecture

### 4.1 Schema Design Principles

- Every table has: `id` (UUID), `created_at`, `updated_at`, `deleted_at` (nullable for soft delete)
- Every tenant-scoped table has: `tenant_id` (UUID, foreign key to institutions)
- Foreign keys use UUIDs
- Indexes on: `tenant_id`, `foreign_keys`, `status`, `created_at` for common queries
- Naming: `snake_case` for tables and columns

### 4.2 Core Entity Relationship

```
institutions
  ├── users (role: admin, teacher, student, parent)
  │     ├── parent_students (link parents to students)
  │
  ├── subscription_plans
  ├── subscriptions (links institution + plan)
  ├── payment_uploads
  │
  ├── academic_years
  ├── classes
  ├── sections
  ├── subjects
  ├── enrollments (links student + class + section)
  │
  ├── exams
  │     ├── questions
  │     ├── answer_keys
  │     ├── exam_sessions
  │     │     ├── student_answers
  │     │     └── results
  │     │           └── question_results
  │     └── notifications
```

### 4.3 Key Table Definitions

```sql
-- institutions (tenant root)
CREATE TABLE institutions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  address       TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  status        VARCHAR(20) DEFAULT 'pending', -- pending | active | disabled
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  deleted_at    TIMESTAMP
);

-- users (all roles)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES institutions(id),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100),
  phone         VARCHAR(20),
  role          VARCHAR(20) NOT NULL, -- platform_owner | super_admin | admin | teacher | student | parent
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  deleted_at    TIMESTAMP
);

-- exams
CREATE TABLE exams (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES institutions(id),
  title                 VARCHAR(255) NOT NULL,
  description           TEXT,
  exam_mode             VARCHAR(20) NOT NULL, -- DIGITAL | PHYSICAL_PAPER
  total_marks           INTEGER NOT NULL,
  marks_per_correct     DECIMAL(5,2) DEFAULT 1,
  marks_per_wrong       DECIMAL(5,2) DEFAULT 0,
  negative_marking      BOOLEAN DEFAULT false,
  duration_minutes      INTEGER NOT NULL,
  status                VARCHAR(20) DEFAULT 'draft', -- draft | published | in_progress | completed | results_released
  scheduled_at          TIMESTAMP,
  deadline_at           TIMESTAMP,
  class_id              UUID REFERENCES classes(id),
  subject_id            UUID REFERENCES subjects(id),
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW(),
  deleted_at            TIMESTAMP
);

-- exam_sessions
CREATE TABLE exam_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES institutions(id),
  exam_id       UUID NOT NULL REFERENCES exams(id),
  student_id    UUID NOT NULL REFERENCES users(id),
  status        VARCHAR(20) DEFAULT 'in_progress', -- in_progress | submitted | auto_submitted | expired
  started_at    TIMESTAMP DEFAULT NOW(),
  submitted_at  TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- student_answers (auto-saved periodically)
CREATE TABLE student_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES institutions(id),
  exam_session_id UUID NOT NULL REFERENCES exam_sessions(id),
  question_id     UUID NOT NULL REFERENCES questions(id),
  selected_option VARCHAR(10), -- A, B, C, D or NULL if skipped
  is_saved        BOOLEAN DEFAULT false,
  saved_at        TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(exam_session_id, question_id)
);

-- results
CREATE TABLE results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES institutions(id),
  exam_session_id UUID UNIQUE NOT NULL REFERENCES exam_sessions(id),
  exam_id         UUID NOT NULL REFERENCES exams(id),
  student_id      UUID NOT NULL REFERENCES users(id),
  total_score     DECIMAL(10,2) NOT NULL,
  total_marks     DECIMAL(10,2) NOT NULL,
  correct_count   INTEGER NOT NULL,
  wrong_count     INTEGER NOT NULL,
  skipped_count   INTEGER NOT NULL,
  percentage      DECIMAL(5,2) NOT NULL,
  rank            INTEGER,
  total_students  INTEGER,
  is_released     BOOLEAN DEFAULT false,
  released_at     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- question_results (per-question breakdown)
CREATE TABLE question_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES institutions(id),
  result_id        UUID NOT NULL REFERENCES results(id),
  question_id      UUID NOT NULL REFERENCES questions(id),
  student_answer   VARCHAR(10),
  correct_answer   VARCHAR(10) NOT NULL,
  is_correct       BOOLEAN DEFAULT false,
  marks_awarded    DECIMAL(5,2) DEFAULT 0,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- notification_logs
CREATE TABLE notification_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES institutions(id),
  exam_id         UUID REFERENCES exams(id),
  student_id      UUID REFERENCES users(id),
  parent_id       UUID REFERENCES users(id),
  channel         VARCHAR(20) NOT NULL, -- whatsapp | email
  status          VARCHAR(20) NOT NULL, -- queued | sent | failed | dead_letter
  message         TEXT,
  error_message   TEXT,
  attempt_number  INTEGER DEFAULT 1,
  max_retries     INTEGER DEFAULT 3,
  sent_at         TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### 4.4 Index Strategy

| Table | Index | Rationale |
|---|---|---|
| users | (tenant_id, role) | Filter users by institution + role |
| users | (email) | Login lookup |
| exams | (tenant_id, status) | List exams by status |
| exams | (tenant_id, class_id) | Exams by class |
| exam_sessions | (exam_id, student_id) | Unique session per student per exam |
| exam_sessions | (tenant_id, status) | Monitor active sessions |
| student_answers | (exam_session_id, question_id) | Unique constraint + lookup |
| results | (exam_id, student_id) | Student's result for exam |
| results | (exam_id, percentage) | Rank calculation |
| notification_logs | (exam_id, status) | Track notification campaign |
| notification_logs | (status, attempt_number) | Retry worker queries |

---

## 5. Security Architecture

### 5.1 Authentication Flow

```
Login Request → Validate email + password (bcrypt compare)
  → Generate access token (JWT, 15min, includes: userId, tenantId, role)
  → Generate refresh token (JWT, 7 days, httpOnly cookie)
  → Return access token in response body
  → Set refresh token as httpOnly cookie

Every Request → Extract JWT from Authorization header
  → Verify signature + expiry
  → Attach decoded payload to req.user
  → Extract tenant_id from req.user.tenantId

Token Refresh → POST /api/v1/auth/refresh
  → Read refresh token from httpOnly cookie
  → Verify signature + expiry
  → Issue new access token + rotate refresh token
```

### 5.2 RBAC Architecture

```
Permission Check Flow:
  req.user.role → RoleHierarchy → PermissionMatrix → Allow/Deny

Role Hierarchy:
  platform_owner > super_admin > admin > teacher > student
  parent is a parallel role with limited read access to linked student data

Permission Matrix (simplified):
        platform_owner  super_admin  admin  teacher  student  parent
CREATE  ✓               ✓            ✓      ✓        ✗        ✗
READ    ✓               ✓            ✓      ✓        ✓*       ✓**
UPDATE  ✓               ✓            ✓      ✓        ✗        ✗
DELETE  ✓               ✓            ✓      ✗        ✗        ✗

* student can read own data only
** parent can read linked student's data only
```

### 5.3 Tenant Isolation

- `tenant_id` extracted from JWT in tenant middleware
- Every Prisma query on tenant data includes `where: { tenant_id: req.tenantId }`
- Repository layer enforces tenant scoping — no method exposes cross-tenant data
- Super Admin has separate service with full audit logging

### 5.4 Data Protection

| Data | Protection |
|---|---|
| Passwords | bcrypt (12 rounds) |
| JWT Secret | 512-bit random, env variable |
| Access Token | 15 min expiry |
| Refresh Token | 7 days, httpOnly, Secure, SameSite=Strict |
| Answer Keys | Never sent to client |
| API Keys (WhatsApp, SendGrid) | Env variables only |
| Database | TLS connection, strong password |
| All Traffic | HTTPS (TLS 1.3+) |

---

## 6. Caching Strategy

### 6.1 Cache Layers

| Data | Cache Key | TTL | Invalidation |
|---|---|---|---|
| Exam list (tenant) | `exams:{tenantId}:list` | 5 min | On exam create/update/delete |
| Exam details | `exams:{examId}` | 10 min | On exam update |
| User profile | `user:{userId}` | 15 min | On profile update |
| Institution settings | `institution:{tenantId}:settings` | 1 hour | On settings update |
| Subscription status | `sub:{tenantId}:status` | 30 min | On payment/subscription change |
| Academic structure | `academic:{tenantId}:{type}` | 1 hour | On structure change |

### 6.2 Cache-Aside Pattern

```javascript
async function getExamById(examId) {
  const cacheKey = `exam:${examId}`;
  let exam = await cache.get(cacheKey);
  if (exam) return JSON.parse(exam);

  exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (exam) await cache.set(cacheKey, JSON.stringify(exam), 'EX', 600);
  return exam;
}
```

---

## 7. Queue Architecture (Bull)

### 7.1 Job Queues

| Queue | Jobs | Concurrency | Retry |
|---|---|---|---|
| notification | Send WhatsApp, Send Email | 10 | 3 (2s, 4s, 8s) |
| evaluation | Auto-score calculation | 5 | 2 |
| report | PDF generation, analytics | 2 | 2 |

### 7.2 Job Flow

```
Producer (API) → Bull Queue → Worker → External Service
     ↑                         ↓
  Response: 200            Update job status in notification_logs
```

### 7.3 Dead-Letter Queue

- Jobs exceeding max retries move to `{queue}:dead`
- Platform Owner alerted daily on dead-letter queue count
- Manual replay capability for dead-letter jobs

---

## 8. Infrastructure Requirements

### 8.1 MVP Deployment

| Component | Specification |
|---|---|
| App Server | 2 vCPU, 4 GB RAM (x2 for HA) |
| PostgreSQL | 4 vCPU, 8 GB RAM, 100 GB SSD |
| Redis | 2 vCPU, 4 GB RAM (with persistence) |
| Storage | S3-compatible for uploads/PDFs |
| CDN | For static assets (Vite build output) |
| Load Balancer | Round-robin or least-connections |

### 8.2 Scaling Path

| Stage | App Servers | DB | Redis |
|---|---|---|---|
| MVP (100 institutions) | 2 | Single primary | Single |
| Growth (500 institutions) | 4-6 | Primary + read replica | Cluster |
| Scale (2,000+ institutions) | 10+ | Primary + multiple replicas | Cluster |

### 8.3 Monitoring

| Tool | Purpose |
|---|---|
| Winston | Application logging (structured JSON) |
| Application Health | `/api/v1/health` endpoint |
| DB Monitoring | Connection count, query performance, lock waits |
| Queue Monitoring | Bull Board for job visibility |
| Error Tracking | Centralized error log aggregation |

---

## 9. Development & Deployment Pipeline

### 9.1 Environment Strategy

| Environment | Purpose | DB |
|---|---|---|
| local | Developer machine | Local PostgreSQL |
| development | Shared dev/integration | Dev server PostgreSQL |
| staging | Pre-production validation | Staging PostgreSQL |
| production | Live | Production PostgreSQL |

### 9.2 CI/CD Requirements

- All code pushed to feature branch
- Automated lint + test run on PR
- PR review required before merge
- Merge to main triggers staging deploy
- Staging tests must pass before production deploy
- DB migrations run as part of deploy pipeline
- Zero-downtime deploys (rolling updates)

### 9.3 Migration Strategy

- Prisma Migrate for schema changes
- Migrations are versioned and reversible
- Destructive migrations require explicit approval
- Backward-compatible changes preferred
- Migrations run before new code deploys

---

## 10. Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| API P99 response time | <500ms | Synthetic monitoring |
| Exam page load (P99) | <2s | Browser timing |
| Auto-save API (P99) | <200ms | Server-side timing |
| Score calc (200 Qs) | <1s | Server-side timing |
| Concurrent sessions | 1,000+ per server | Load testing |
| WhatsApp delivery | <5 min from release | End-to-end timing |
| DB query (simple) | <10ms | Query profiling |
| DB query (complex join) | <100ms | Query profiling |

---

## 11. External API Contracts

### 11.1 Meta WhatsApp Cloud API

- API Base: `https://graph.facebook.com/v19.0/{phone-number-id}/messages`
- Auth: Permanent access token from Meta Business Account
- Method: POST
- Body: Template-based message with parameters for student name, score, rank, etc.
- Rate Limits: 250 messages per 24-hour period per phone number (MVP)

### 11.2 SendGrid (Email Fallback)

- API: SendGrid v3 Mail Send API
- Auth: API Key (env variable)
- Templates: Password reset, notification fallback

### 11.3 Puppeteer (PDF Generation)

- Purpose: Generate question paper PDF for Mode 2 printing
- Trigger: Teacher clicks "Print Question Paper"
- Execution: Isolated in worker process, not in request path
- Output: PDF stored in S3-compatible storage

---

## 12. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 13. Approval Sign-Off

**Document:** DOC 1.3 — Technical Requirements Document
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-14 | ✅ Approved |
