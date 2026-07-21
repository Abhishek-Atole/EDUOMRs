# DOC 2.1 — High-Level Design (HLD)

**Document ID:** 2.1
**Title:** High-Level Design — EduOMR System Architecture
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Engineering
**Date:** 2026-07-14
**Purpose:** Define the high-level system architecture, component interactions, data flow, and deployment structure for EduOMR.

---

## 1. System Architecture Overview

EduOMR follows a **modular monolith** architecture deployed as a single application unit, with clearly separated internal modules organized by business domain. The system is designed for future extraction into microservices without major rewrites.

### 1.1 Architecture Style

| Property | Choice | Rationale |
|---|---|---|
| Architecture style | Modular monolith | Simplest deployable unit; no network overhead between modules; single codebase |
| Internal structure | Domain-oriented modules | Modules map to business domains; each has Controller → Service → Repository |
| Communication pattern | In-process method calls | Between modules via service interfaces; future extraction via API calls |
| State management | Stateless app servers | All state in PostgreSQL + Redis; horizontal scaling by adding servers |
| Deployment model | Single unit | One Docker container or VM image; load-balanced across instances |

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LOAD BALANCER                                 │
│                    (Round-robin / Least Connections)                  │
└─────────┬───────────────────────────────────┬───────────────────────┘
          │                                    │
┌─────────▼──────────┐          ┌─────────────▼───────────────────────┐
│   App Server 1      │          │         App Server 2                │
│  ┌───────────────┐  │          │    ┌───────────────────────────┐   │
│  │ Module Layer   │  │          │    │    Module Layer            │   │
│  │ ┌───┐ ┌───┐   │  │          │    │   ┌───┐ ┌───┐ ┌───┐      │   │
│  │ │A  │ │B  │   │  │          │    │   │A  │ │B  │ │C  │      │   │
│  │ └───┘ └───┘   │  │          │    │   └───┘ └───┘ └───┘      │   │
│  │ ┌───┐ ┌───┐   │  │          │    │   ┌───┐ ┌───┐ ┌───┐      │   │
│  │ │C  │ │D  │   │  │          │    │   │D  │ │E  │ │F  │      │   │
│  │ └───┘ └───┘   │  │          │    │   └───┘ └───┘ └───┘      │   │
│  └───────────────┘  │          │    └───────────────────────────┘   │
│  ┌───────────────┐  │          │    ┌───────────────────────────┐   │
│  │ Shared Layer   │  │          │    │    Shared Layer            │   │
│  │ • Auth JWT    │  │          │    │   • Auth JWT               │   │
│  │ • Middleware  │  │          │    │   • Middleware              │   │
│  │ • Prisma ORM  │  │          │    │   • Prisma ORM              │   │
│  │ • Redis Cache │  │          │    │   • Redis Cache             │   │
│  │ • Bull Queue  │  │          │    │   • Bull Queue              │   │
│  └───────────────┘  │          │    └───────────────────────────┘   │
└─────────────────────┘          └────────────────────────────────────┘
          │                                    │
          └────────────────┬───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Redis      │
                    │  (Cache + Q)│
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌────────────┐
        │PostgreSQL│ │   S3     │ │  External  │
        │(Primary) │ │  (Files) │ │  APIs      │
        └──────────┘ └──────────┘ │ • Meta WA  │
                                  │ • SendGrid │
                                  └────────────┘
```

---

## 2. Component Architecture

### 2.1 Module Structure

```
src/
├── app.js                          # Express app setup
├── server.js                       # HTTP server startup
├── config/
│   ├── env.js                      # Environment variable loader (Zod validated)
│   ├── constants.js                # Shared constants
│   └── roles.js                    # Role definitions and hierarchy
│
├── middleware/
│   ├── requestId.js                # UUID per request
│   ├── auth.js                     # JWT verification
│   ├── rbac.js                     # Role-based access control
│   ├── tenant.js                   # Tenant context extraction
│   ├── validate.js                 # Zod schema validation
│   ├── errorHandler.js             # Global error handler
│   └── rateLimiter.js              # Rate limiting
│
├── modules/
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.repository.js
│   │   └── auth.schema.js          # Zod schemas for auth endpoints
│   │
│   ├── institution/
│   │   ├── institution.controller.js
│   │   ├── institution.service.js
│   │   ├── institution.repository.js
│   │   └── institution.schema.js
│   │
│   ├── subscription/
│   │   ├── subscription.controller.js
│   │   ├── subscription.service.js
│   │   ├── subscription.repository.js
│   │   └── subscription.schema.js
│   │
│   ├── user/
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   ├── user.repository.js
│   │   └── user.schema.js
│   │
│   ├── academic/
│   │   ├── academic.controller.js
│   │   ├── academic.service.js
│   │   ├── academic.repository.js
│   │   └── academic.schema.js
│   │
│   ├── exam/
│   │   ├── exam.controller.js
│   │   ├── exam.service.js
│   │   ├── exam.repository.js
│   │   └── exam.schema.js
│   │
│   ├── question/
│   │   ├── question.controller.js
│   │   ├── question.service.js
│   │   ├── question.repository.js
│   │   └── question.schema.js
│   │
│   ├── answerKey/
│   │   ├── answerKey.controller.js
│   │   ├── answerKey.service.js
│   │   ├── answerKey.repository.js
│   │   └── answerKey.schema.js
│   │
│   ├── examSession/
│   │   ├── examSession.controller.js
│   │   ├── examSession.service.js
│   │   ├── examSession.repository.js
│   │   └── examSession.schema.js
│   │
│   ├── submission/
│   │   ├── submission.controller.js
│   │   ├── submission.service.js
│   │   ├── submission.repository.js
│   │   └── submission.schema.js
│   │
│   ├── result/
│   │   ├── result.controller.js
│   │   ├── result.service.js
│   │   ├── result.repository.js
│   │   └── result.schema.js
│   │
│   └── notification/
│       ├── notification.controller.js
│       ├── notification.service.js
│       ├── notification.repository.js
│       └── notification.schema.js
│
├── infrastructure/
│   ├── database/
│   │   └── prisma.js               # Prisma singleton client
│   ├── cache/
│   │   └── redis.js                # Redis client
│   ├── queue/
│   │   └── bull.js                 # Bull queue setup
│   ├── whatsapp/
│   │   └── whatsapp.js             # Meta Cloud API client
│   ├── email/
│   │   └── email.js                # Nodemailer client
│   └── pdf/
│       └── pdf.js                  # Puppeteer client
│
├── jobs/
│   ├── notification.worker.js      # WhatsApp + email job processor
│   ├── evaluation.worker.js        # Score calculation worker
│   └── report.worker.js            # Report generation worker
│
├── utils/
│   ├── response.util.js            # Standardized response helpers
│   ├── score.util.js               # Score calculation engine
│   ├── pagination.util.js          # Pagination helper
│   └── phone.util.js               # Phone number formatting
│
└── types/
    ├── enums.js                    # ExamMode, UserRole, etc.
    └── errors.js                   # Custom error classes
```

### 2.2 Module Dependency Graph

```
                 ┌─────────────┐
                 │     Auth    │
                 └──────┬──────┘
                        │ depends on
              ┌─────────▼─────────┐
              │   Institution     │
              └─────────┬─────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
  ┌──────────┐  ┌──────────────┐  ┌──────────────┐
  │   User   │  │ Subscription │  │   Academic   │
  └────┬─────┘  └──────────────┘  └──────┬───────┘
       │                                  │
       └──────────────┬───────────────────┘
                      ▼
              ┌───────────────┐
              │     Exam      │
              └───────┬───────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
  ┌──────────┐ ┌────────────┐ ┌──────────────┐
  │ Question │ │ AnswerKey  │ │ ExamSession  │
  └──────────┘ └────────────┘ └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  Submission   │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐     ┌──────────────┐
                              │   Result      │◄───►│ Notification │
                              └──────────────┘     └──────────────┘
```

---

## 3. Data Flow Diagrams

### 3.1 Exam Creation Flow

```
Teacher → Web UI → POST /api/v1/exams
  → [Middleware: auth, rbac(teacher), tenant]
  → [Validate: Zod schema]
  → ExamController.create(req, res)
  → ExamService.createExam(examData, questions)
  → ExamRepository.create(exam) + QuestionRepository.createBulk(questions)
  → Prisma → PostgreSQL
  → Response: { success: true, data: { exam } }
```

### 3.2 Student Exam Flow (Mode 1)

```
Student → Web UI → POST /api/v1/exam-sessions/start
  → [Middleware: auth, rbac(student), tenant, subscription]
  → ExamSessionController.start(req, res)
  → ExamSessionService.startSession(studentId, examId)
  → Validate: exam published, within window, no existing session
  → ExamSessionRepository.create({ status: 'in_progress' })
  → Response: { sessionId, deadline }

  ↓

Student → GET /api/v1/exam-sessions/:id/mode1
  → ExamSessionController.getMode1(req, res)
  → Returns: questions[], omrState[], timer, status

  ↓ (every 30 seconds)

Student → Client auto-save → POST /exam-sessions/:id/save
  → [Middleware: auth, tenant]
  → SubmissionController.saveAnswers(req, res)
  → Validate: deadline not passed, session in_progress
  → SubmissionService.upsertAnswers(sessionId, answers)
  → SubmissionRepository.upsert(sessionId, questionId, answer)
  → Prisma → PostgreSQL (UPSERT)
  → Response: { saved: true, savedAt }

  ↓ (student clicks submit)

Student → POST /exam-sessions/:id/submit
  → SubmissionController.submit(req, res)
  → SubmissionService.submitExam(sessionId)
  → Validate deadline, save pending answers
  → Update session status = 'submitted'
  → Queue: evaluation worker (score calculation)
  → Response: { success: true }

  ↓

Evaluation Worker (async)
  → ScoreCalculationService.calculate(sessionId)
  → For each question: compare answer vs answer key
  → Create Result + QuestionResult records
  → Calculate rank
  → Done
```

### 3.3 Result Release & Notification Flow

```
Teacher → POST /api/v1/exams/:id/release-result
  → [Middleware: auth, rbac(teacher), tenant]
  → ResultController.release(req, res)
  → ResultService.releaseResults(examId)
  → Update exam status = 'results_released'
  → Update all results: is_released = true
  → For each result with linked parent:
      Queue notification job in Bull
  → Response: 200 OK (immediate)

  ↓ (async)

Notification Worker
  → WhatsAppService.send(parentPhone, template)
  → Success: Log notification_logs (status: 'sent')
  → Fail (retry 3x):
      → EmailFallbackService.send(parentEmail, message)
      → Success: Log email sent
      → Fail: Move to dead-letter queue
```

---

## 4. Layer Architecture

### 4.1 Request Processing Pipeline

```
Incoming Request
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE CHAIN                           │
│                                                              │
│  1. requestId          → Assign UUID to each request          │
│  2. rateLimiter        → 100 req/min per user                │
│  3. auth               → Verify JWT, attach req.user          │
│  4. rbac               → Check role permission                │
│  5. tenant             → Extract tenant_id from JWT           │
│  6. subscription       → Check active subscription (if req)   │
│  7. validate           → Zod schema validation of body/params │
│                                                              │
└──────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│                    CONTROLLER                                 │
│  • Parse validated input from req.body/params/query           │
│  • Call service method                                         │
│  • Return standardized response                                │
│  • No business logic                                           │
└──────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│                    SERVICE                                    │
│  • Business logic & orchestration                             │
│  • Calls repositories                                         │
│  • Enforces business rules                                    │
│  • No HTTP awareness                                          │
└──────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│                    REPOSITORY                                 │
│  • Data access via Prisma                                     │
│  • Enforces tenant_id filtering                               │
│  • Implements caching (Redis)                                 │
│  • No business logic                                          │
└──────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE                             │
│  • PostgreSQL (primary data)                                  │
│  • Redis (cache + queue)                                      │
│  • External APIs (WhatsApp, SendGrid)                         │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Layer Rules

| Layer | Responsibility | Can Import From | Cannot Import |
|---|---|---|---|
| Controller | HTTP handling, validation, response | Service, Schema | Repository, Database |
| Service | Business logic, orchestration | Repository, Infrastructure | HTTP, Request/Response |
| Repository | Data access, caching | Prisma, Redis | Business logic |
| Infrastructure | External connections | — | Business logic, HTTP |

---

## 5. Caching Architecture

### 5.1 Cache Strategy

```
Request → Controller → Service → Repository → [Redis Cache?]
                                                 │
                                          ┌──────▼──────┐
                                          │  Cache Hit  │
                                          │  → Return   │
                                          └─────────────┘
                                          ┌──────▼──────┐
                                          │  Cache Miss │
                                          │  → Query DB │
                                          │  → Set Cache│
                                          │  → Return   │
                                          └─────────────┘
```

### 5.2 Cache Invalidation

| Data Change | Cache Invalidation |
|---|---|
| Exam created/updated | `exams:{tenantId}:list`, `exam:{examId}` |
| User updated | `user:{userId}` |
| Subscription changed | `sub:{tenantId}:status` |
| Academic structure changed | `academic:{tenantId}:{type}` |

Invalidation is **write-through** — on every data mutation, related cache keys are deleted before response is sent.

---

## 6. Queue Architecture

### 6.1 Bull Queues

| Queue Name | Purpose | Concurrency | Retry | TTL |
|---|---|---|---|---|
| notification | WhatsApp + email sending | 10 | 3 (2s, 4s, 8s) | 5 min |
| evaluation | Score calculation + ranking | 5 | 2 | 2 min |
| report | PDF generation | 2 | 2 | 10 min |

### 6.2 Dead-Letter Queue

- Jobs exceeding max retries move to `{queue}:dead`
- Dead-letter queue monitored daily
- Manual replay available via Bull Board UI

---

## 7. Multi-Tenancy Architecture

### 7.1 Tenant Context Flow

```
JWT Token (decoded):
{
  userId: "uuid",
  tenantId: "uuid",
  role: "teacher",
  email: "teacher@school.com",
  iat: timestamp,
  exp: timestamp
}

Tenant Middleware:
  req.tenantId = req.user.tenantId  // From JWT, NOT from request

Repository (every method):
  async findByTenant(tenantId, filters) {
    return prisma.model.findMany({
      where: { tenant_id: tenantId, ...filters }
    })
  }
```

### 7.2 Isolation Guarantee

- **Data isolation:** Every tenant-scoped table has `tenant_id` column
- **Query isolation:** Repository layer enforces `where: { tenant_id: req.tenantId }`
- **Middleware enforcement:** Tenant middleware runs before every controller
- **Global data:** Reference data (config, plans) shared across tenants
- **Super Admin:** Separate service for cross-tenant operations with full audit

---

## 8. Security Architecture (High-Level)

### 8.1 Security Layers

```
Layer 1: Network
  → HTTPS only (TLS 1.3+)
  → No direct DB exposure
  → Rate limiting on all endpoints

Layer 2: Auth
  → JWT access token (15 min)
  → Refresh token (7 days, httpOnly)
  → bcrypt password hashing (12 rounds)

Layer 3: Authorization
  → RBAC middleware per endpoint
  → Role hierarchy enforced
  → Tenant isolation mandatory

Layer 4: Input
  → Zod validation on all endpoints
  → File type/size validation
  → Prisma parameterized queries (SQL injection safe)

Layer 5: Data
  → Answer keys never sent to client
  → Score never computed on client
  → PII not exposed in logs
```

---

## 9. External Integrations

| Integration | Protocol | Authentication | Failover |
|---|---|---|---|
| Meta WhatsApp Cloud API | REST/HTTPS | Permanent Access Token | Email fallback |
| SendGrid | REST/HTTPS | API Key | Logging only |
| Puppeteer | Subprocess | N/A | Error logging |
| S3-compatible storage | REST/HTTPS | Access Key + Secret | Local fallback |

---

## 10. Scalability Strategy

### 10.1 Horizontal Scaling

| Component | Scaling Approach |
|---|---|
| App Servers | Add behind load balancer (stateless) |
| PostgreSQL | Primary + read replicas (post-MVP) |
| Redis | Cluster mode (post-MVP) |
| Queue | Multiple workers per queue |
| Files | S3-compatible (inherently scalable) |

### 10.2 Performance Budget

| Operation | Budget | Measurement |
|---|---|---|
| API response (P99) | <500ms | Server-side timing |
| Auto-save (P99) | <200ms | Server-side timing |
| Score calc (200 Qs) | <1s | Worker timing |
| Exam page load | <2s | Browser timing |
| WhatsApp delivery | <5 min | End-to-end |

---

## 11. Monitoring & Observability

### 11.1 Logging

- Structured JSON logs via Winston
- Every log includes: timestamp, level, requestId, userId, tenantId
- Log destinations: stdout (container), file (rotation), centralized (future)

### 11.2 Health Check Endpoint

```
GET /api/v1/health
→ {
    status: "ok",
    timestamp: "ISO-8601",
    version: "1.0.0",
    uptime: seconds,
    db: { connected: true, latency_ms: 2 },
    redis: { connected: true, latency_ms: 1 },
    queue: { pending: 5, failed: 0 }
  }
```

### 11.3 Metrics to Monitor

| Metric | Alert Threshold |
|---|---|
| API error rate | >1% over 5 min |
| API P99 latency | >1s over 5 min |
| DB connection count | >80% of max |
| Queue depth (notification) | >1,000 pending |
| Dead-letter queue count | >0 |
| App server CPU | >80% over 5 min |
| App server memory | >85% |

---

## 12. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 13. Approval Sign-Off

**Document:** DOC 2.1 — High-Level Design
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-14 | ✅ Approved |
