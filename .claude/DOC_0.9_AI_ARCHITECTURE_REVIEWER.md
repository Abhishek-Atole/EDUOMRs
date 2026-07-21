# DOC 0.9 — AI Architecture Reviewer

**Document ID:** 0.9  
**Title:** AI Architecture Reviewer — Architecture Design & Review Protocol  
**Version:** 1.0.0  
**Status:** Approved  
**Owner:** AI Architecture Review Process  
**Date:** 2026-07-13  
**Purpose:** Define the comprehensive architecture review protocol for all architectural decisions, system design, and structural changes in EduOMR to ensure scalability, maintainability, and alignment with enterprise standards.

---

## 1. Mission

The AI Architecture Reviewer is responsible for:

- **Design Validation:** Ensuring architectural decisions are sound
- **Principle Compliance:** Enforcing architecture principles from PROJECT_KNOWLEDGE.md
- **Scalability Verification:** Confirming system can scale to millions of users
- **Modularity Assurance:** Ensuring clean, domain-oriented modules
- **Technology Fit:** Verifying technology choices support requirements
- **Trade-off Documentation:** Recording why certain decisions were made
- **Consistency Enforcement:** Preventing architectural drift

Every architectural review must enforce:
- **Clean Architecture** (separation of concerns, testability)
- **Modular Monolith** (MVP) → **Microservice-ready** (future)
- **API First** (all communication via APIs)
- **Domain-Oriented Modules** (organized by business domain)
- **Horizontal Scaling Ready** (stateless, distributed)
- **12-Factor App Compliance** (environment config, no hardcoded values)
- **Multi-tenancy by Design** (not bolted on later)

---

## 2. Architecture Review Dimensions

### 2.1 System Architecture (High-Level)

**Scope:**
- Overall system components
- Component interactions
- Data flow
- Deployment architecture

**Checklist:**

#### Component Organization
- [ ] System divided into logical modules (Core, Education, Examination, Communication, AI)
- [ ] Each module has clear responsibility
- [ ] Module boundaries are well-defined
- [ ] No circular dependencies between modules
- [ ] Cross-module communication only via APIs (not direct database access)
- [ ] Shared infrastructure identified (Auth, DB, Cache, Queue)

#### Data Flow
- [ ] Data flow diagram exists
- [ ] User input flows through validation layer first
- [ ] Sensitive data (passwords, tokens, answer keys) clearly marked
- [ ] Data doesn't leak across tenants
- [ ] Audit logging points identified
- [ ] No data passed through untrusted clients

#### Deployment Architecture
- [ ] Single deployment unit (monolith) for MVP
- [ ] Load balancer in front of app servers
- [ ] Stateless app servers (no session in process memory)
- [ ] Centralized database (PostgreSQL)
- [ ] Centralized cache (Redis)
- [ ] Message queue for async jobs (Bull on Redis)
- [ ] Separate storage for user uploads (S3 or similar)
- [ ] CDN for static assets
- [ ] Logs aggregated to central service

**Red Flags:**
- No clear module boundaries
- Circular dependencies
- Direct database queries across modules
- Monolithic class with 5,000+ lines
- Tight coupling between layers
- Session data in process memory

---

### 2.2 Domain-Oriented Modular Design

**Scope:**
- Module structure aligned with business domains
- Clear responsibility per module
- Service layer organization

**Checklist:**

#### Module Structure
```
src/
├── core/                      # Cross-cutting concerns
│   ├── auth/
│   ├── authorization/
│   ├── middleware/
│   ├── utils/
│   └── constants/
├── education/                 # Education domain
│   ├── academicYear/
│   ├── class/
│   ├── section/
│   ├── subject/
│   ├── teacher/
│   ├── student/
│   └── parent/
├── examination/               # Examination domain
│   ├── exam/
│   ├── question/
│   ├── answer/
│   ├── result/
│   ├── timer/
│   └── scoreCalculation/
├── communication/             # Notification domain
│   ├── whatsapp/
│   ├── email/
│   └── announcement/
├── subscription/              # Subscription domain
│   ├── plan/
│   ├── payment/
│   └── institution/
└── shared/                    # Shared utilities
    ├── database/
    ├── cache/
    ├── queue/
    └── logger/
```

- [ ] Each module has clear business domain
- [ ] Module has single responsibility
- [ ] Controllers exist (HTTP entry points)
- [ ] Services exist (business logic)
- [ ] Repositories exist (data access)
- [ ] Models/DTOs exist (data structures)
- [ ] No business logic in controllers
- [ ] No database queries in services
- [ ] No cross-module direct database access

#### Module Boundaries (API-First)
- [ ] Cross-module communication only via service methods
- [ ] Module exports only public interfaces
- [ ] Internal implementation details hidden
- [ ] No shared database tables across modules
- [ ] Async communication via event queue (when applicable)

#### Service Layer Organization
```javascript
// ✅ Good: Service has single responsibility
class ScoreCalculationService {
  calculateScore(answers, answerKey, config) { ... }
  calculatePercentage(score, total) { ... }
  calculateRank(score, allScores) { ... }
}

// ✅ Good: Service uses repository for data access
class ExamService {
  constructor(examRepository) {
    this.examRepository = examRepository;
  }
  
  async getExam(examId) {
    return this.examRepository.findById(examId);
  }
}

// ❌ Bad: Service does too much
class ExamService {
  getExam() { ... }
  createExam() { ... }
  calculateScore() { ... }
  sendNotification() { ... }
  generateReport() { ... }
}

// ❌ Bad: Service queries database directly
class ExamService {
  async getExam(id) {
    return db.query(`SELECT * FROM exams WHERE id = ${id}`);
  }
}
```

**Red Flags:**
- Modules with unclear responsibility
- Services doing multiple unrelated things
- Business logic in controllers
- Database queries in services
- Circular module dependencies

---

### 2.3 Layered Architecture (Clean Architecture)

**Scope:**
- Proper separation between layers
- Dependency direction (inward only)
- Testability of each layer

**Layers (from outer to inner):**

```
┌─────────────────────────────────┐
│   API Layer (Controllers)       │ ← Entry points
├─────────────────────────────────┤
│   Service Layer (Business)      │ ← Logic here
├─────────────────────────────────┤
│   Repository Layer (Data)       │ ← DB access here
├─────────────────────────────────┤
│   Domain Models                 │ ← Business entities
├─────────────────────────────────┤
│   Core Infrastructure           │ ← Database, Cache, Queue
└─────────────────────────────────┘

Rule: Outer layers depend on inner layers only.
Never: Inner layers depend on outer layers.
```

**API Layer (Controllers):**
```javascript
// ✅ Good: Controller delegates to service
class ExamController {
  constructor(examService) {
    this.examService = examService;
  }
  
  async getExam(req, res) {
    const exam = await this.examService.getExam(req.params.id);
    res.json(exam);
  }
}

// ❌ Bad: Business logic in controller
class ExamController {
  async getExam(req, res) {
    const exam = await db.query('SELECT * FROM exams WHERE id = ?', req.params.id);
    const results = await db.query('SELECT * FROM results WHERE exam_id = ?', exam.id);
    const score = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    res.json({ exam, avgScore: score });
  }
}
```

**Service Layer (Business Logic):**
```javascript
// ✅ Good: Service uses repository
class ExamService {
  constructor(examRepository) {
    this.examRepository = examRepository;
  }
  
  async getExam(id) {
    return this.examRepository.findById(id);
  }
}

// ❌ Bad: Service queries database directly
class ExamService {
  async getExam(id) {
    return db.query('SELECT * FROM exams WHERE id = ?', id);
  }
}
```

**Repository Layer (Data Access):**
```javascript
// ✅ Good: Repository encapsulates data access
class ExamRepository {
  async findById(id) {
    return prisma.exam.findUnique({ where: { id } });
  }
  
  async findByTenant(tenantId) {
    return prisma.exam.findMany({ where: { tenant_id: tenantId } });
  }
}

// ❌ Bad: Raw queries exposed
class ExamRepository {
  async findById(id) {
    return prisma.$queryRaw`SELECT * FROM exams WHERE id = ${id}`;
  }
}
```

**Checklist:**
- [ ] Each layer has single responsibility
- [ ] Dependencies point inward only
- [ ] Controllers don't contain business logic
- [ ] Services don't query database directly
- [ ] Controllers don't query database directly
- [ ] Repositories hidden behind interfaces
- [ ] No circular dependencies between layers
- [ ] Each layer is independently testable

**Red Flags:**
- Business logic in controllers
- Database queries in services
- Controllers or services querying database directly
- Layers with mixed responsibilities
- Circular layer dependencies

---

### 2.4 Multi-Tenancy Architecture

**Scope:**
- Tenant data isolation
- Shared infrastructure vs. isolated databases
- Query filtering strategy

**Checklist:**

#### Data Isolation Strategy
- [ ] Single database for all tenants (shared schema)
- [ ] Every tenant-scoped table has `tenant_id` column
- [ ] Every query on tenant-scoped data filters by `tenant_id`
- [ ] `tenant_id` comes from JWT, NEVER from request
- [ ] No query exposes data without tenant filter
- [ ] Database constraints enforce tenant_id presence
- [ ] Cascade delete prevents orphaned data

#### Repository Pattern for Multi-Tenancy
```javascript
// ✅ Good: Tenant-aware repository
class ExamRepository {
  async findByTenant(tenantId, filters = {}) {
    return prisma.exam.findMany({
      where: { tenant_id: tenantId, ...filters },
    });
  }
}

// ✅ Good: Middleware injects tenant_id
app.use(extractTenantFromJWT, (req, res, next) => {
  req.tenant_id = req.user.tenant_id; // From JWT, never from request
  next();
});

// ❌ Bad: Tenant_id from request (user could change it)
app.get('/api/exams', (req, res) => {
  const tenantId = req.query.tenant_id; // WRONG!
  const exams = db.query('SELECT * FROM exams WHERE tenant_id = ?', tenantId);
  res.json(exams);
});

// ❌ Bad: Query missing tenant filter (data leak)
class ExamRepository {
  async findAll() {
    return prisma.exam.findMany(); // ALL exams, all tenants!
  }
}
```

#### Audit Logging
- [ ] `tenant_id` logged with every sensitive operation
- [ ] Who did what in which tenant is traceable
- [ ] Audit logs searchable by tenant_id

**Red Flags:**
- tenant_id from request instead of JWT
- Queries missing tenant_id filter
- Shared data between tenants
- No audit trail

---

### 2.5 API Design (REST)

**Scope:**
- Endpoint structure
- Request/Response format
- Error handling
- Versioning

**Checklist:**

#### Endpoint Design
```javascript
// ✅ Good: RESTful, version-prefixed, resource-oriented
GET    /api/v1/exams              // List all exams
GET    /api/v1/exams/:id          // Get one exam
POST   /api/v1/exams              // Create exam
PUT    /api/v1/exams/:id          // Update exam
DELETE /api/v1/exams/:id          // Delete exam
POST   /api/v1/exams/:id/submit   // Custom action

// ❌ Bad: Not RESTful, inconsistent
GET  /api/getExams
POST /api/createExam
GET  /api/examDetails/:id
POST /api/updateExamData
DELETE /api/removeExam/:id
```

- [ ] Endpoints follow REST conventions (GET, POST, PUT, DELETE)
- [ ] Endpoints are version-prefixed (/api/v1/)
- [ ] Resources are nouns, not verbs (/exams, not /getExams)
- [ ] HTTP status codes correct (200, 201, 400, 403, 404, 500)
- [ ] Error responses consistent (error object with message, code)
- [ ] Pagination implemented for list endpoints
- [ ] Filtering capability documented
- [ ] Sorting capability documented

#### Request/Response Format
```javascript
// ✅ Good: Consistent error response
{
  success: false,
  error: {
    code: 'UNAUTHORIZED',
    message: 'Invalid token',
    details: { /* optional */ }
  }
}

// ✅ Good: Consistent success response
{
  success: true,
  data: { id: 1, title: 'Exam 1' }
}

// ✅ Good: Pagination response
{
  success: true,
  data: [ ... ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 150,
    pages: 8
  }
}
```

- [ ] All responses have consistent structure
- [ ] Error responses include error code + message
- [ ] Success responses have `data` field
- [ ] Pagination included in list responses
- [ ] No sensitive data in error messages

**Red Flags:**
- Inconsistent error response format
- Sensitive data in error messages
- No versioning in API endpoints
- No pagination on list endpoints

---

### 2.6 Asynchronous Processing (Background Jobs)

**Scope:**
- When to use queues
- Job reliability
- Error handling and retries

**Checklist:**

#### Queue Usage
```javascript
// ✅ Good: Long operation queued (non-blocking)
app.post('/api/exams/:id/release-result', (req, res) => {
  // Immediate response
  notificationQueue.add({
    type: 'release_result',
    exam_id: req.params.id,
  });
  res.json({ success: true });
});

// ❌ Bad: Blocking HTTP response (slow)
app.post('/api/exams/:id/release-result', async (req, res) => {
  // Sends notifications synchronously (blocks response)
  const students = await getExamStudents(req.params.id);
  for (const student of students) {
    await sendWhatsApp(student); // Blocks!
  }
  res.json({ success: true });
});
```

- [ ] Long-running operations queued (> 100ms)
- [ ] WhatsApp notifications queued
- [ ] Email notifications queued
- [ ] PDF generation queued
- [ ] Batch operations queued
- [ ] Queue backed by Redis
- [ ] Job idempotency verified (safe to retry)
- [ ] Retry logic with exponential backoff
- [ ] Dead letter queue for permanently failed jobs
- [ ] Job status tracking

#### Job Reliability
- [ ] Jobs are idempotent (same result if run multiple times)
- [ ] Job status persisted (failed, succeeded, pending)
- [ ] Retry mechanism implemented
- [ ] Max retries limited (3-5)
- [ ] Exponential backoff between retries
- [ ] Failed job alerts to admin

**Red Flags:**
- Synchronous API calls that should be async
- No retry mechanism
- Job failures silently ignored
- Unbounded retries (infinite loop)
- No dead letter queue

---

### 2.7 Caching Strategy

**Scope:**
- What to cache
- Cache invalidation
- Cache layer placement

**Checklist:**

#### Cache Placement
```
Request → API Layer → Service Layer → Cache Layer → Database
                         ↓ (cache hit)
                    Return cached data
```

- [ ] Cache at repository layer (closest to DB)
- [ ] Never cache at controller layer
- [ ] Cache keys namespaced (exam:123, user:456)
- [ ] Cache TTL set appropriately
- [ ] Cache invalidation strategy documented
- [ ] Cache statistics logged (hits, misses, evictions)

#### Cache Invalidation
```javascript
// ✅ Good: Invalidate related cache on update
async updateExam(examId, data) {
  await Exam.update(data, { where: { id: examId } });
  
  // Invalidate affected caches
  await cache.del(`exam:${examId}`);
  await cache.del(`exam:list:${data.institution_id}`);
  await cache.del(`teacher:exams:${data.teacher_id}`);
}

// ❌ Bad: No cache invalidation (stale data)
async updateExam(examId, data) {
  return Exam.update(data, { where: { id: examId } });
}
```

- [ ] Cache invalidated on data modification
- [ ] Cascade invalidation for related data
- [ ] TTL-based expiration as fallback
- [ ] No unbounded cache growth
- [ ] Cache memory monitored

**Red Flags:**
- No cache strategy
- Stale data served
- Unbounded cache growth
- No invalidation on updates

---

### 2.8 Security Architecture

**Scope:**
- Authentication flow
- Authorization architecture
- Data protection layers

**Checklist:**

#### Authentication Flow
```
User Login → Validate Credentials → Issue JWT + Refresh Token
                                           ↓
              All Requests → Validate JWT → Extract tenant_id
```

- [ ] JWT used for stateless auth
- [ ] Refresh token strategy implemented
- [ ] Token expiry reasonable (access: 15min, refresh: 7 days)
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] Password reset tokens time-limited (1 hour)
- [ ] No plaintext passwords stored

#### Authorization Architecture
```javascript
// ✅ Good: RBAC at repository layer
class ExamRepository {
  async findById(id, userId, userRole) {
    // Verify access before returning
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!this.canAccess(exam, userId, userRole)) {
      throw new ForbiddenError('Not authorized');
    }
    return exam;
  }
  
  canAccess(exam, userId, userRole) {
    if (userRole === 'STUDENT') {
      return exam.students.includes(userId);
    }
    if (userRole === 'TEACHER') {
      return exam.teacher_id === userId;
    }
    return true; // Admin
  }
}
```

- [ ] RBAC implemented at repository level
- [ ] Permissions cached (not recalculated per request)
- [ ] Access control tested for every endpoint
- [ ] Audit logging on permission denial

#### Data Protection Layers
- [ ] HTTPS only (TLS 1.3+)
- [ ] Data encrypted at rest (optional, depends on sensitivity)
- [ ] Sensitive fields excluded from responses
- [ ] Answer keys never sent to client
- [ ] Scores validated server-side only

**Red Flags:**
- No authorization checks
- Authorization only on frontend
- Plaintext sensitive data
- Answer keys exposed to client

---

### 2.9 Error Handling & Resilience

**Scope:**
- Exception handling strategy
- Circuit breaker patterns
- Graceful degradation

**Checklist:**

#### Exception Handling
```javascript
// ✅ Good: Specific exception handling
class ExamService {
  async submitExam(studentId, answers) {
    try {
      const exam = await this.examRepository.findById(examId);
      if (!exam) throw new NotFoundError('Exam not found');
      if (exam.isExpired()) throw new BadRequestError('Exam time expired');
      
      const score = this.calculateScore(answers);
      await this.resultRepository.save({ studentId, score });
      return score;
    } catch (error) {
      if (error instanceof NotFoundError) {
        logger.warn('Exam not found', { examId });
      } else if (error instanceof BadRequestError) {
        logger.warn('Invalid request', { error: error.message });
      } else {
        logger.error('Unexpected error', { error, stack: error.stack });
      }
      throw error;
    }
  }
}

// ❌ Bad: Generic catch-all (loses info)
try {
  // ... code
} catch (e) {
  console.log('Error:', e);
}
```

- [ ] Custom exceptions for different error types
- [ ] Specific error messages (not generic)
- [ ] Error context logged (request ID, user, resource)
- [ ] Stack traces in logs (not user-facing)
- [ ] User-friendly error messages to frontend

#### Circuit Breaker Pattern (for external APIs)
```javascript
// ✅ Good: Fallback when external service fails
class WhatsAppService {
  async sendNotification(phone, message) {
    if (this.circuitBreaker.isOpen()) {
      logger.warn('Circuit breaker open, using email fallback');
      return this.emailService.send(/* ... */);
    }
    
    try {
      const result = await this.whatsappAPI.send(phone, message);
      this.circuitBreaker.recordSuccess();
      return result;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      if (this.circuitBreaker.isOpen()) {
        logger.error('Too many failures, opening circuit');
      }
      throw error;
    }
  }
}
```

- [ ] Circuit breaker for external API calls
- [ ] Fallback mechanism when primary fails
- [ ] Graceful degradation (service continues, reduced functionality)

**Red Flags:**
- Generic catch-all exceptions
- Errors silently ignored
- No fallback for external service failures
- No circuit breaker pattern

---

### 2.10 Infrastructure & DevOps Architecture

**Scope:**
- Deployment strategy
- Monitoring
- Scaling

**Checklist:**

#### Infrastructure Layers
```
Internet
   ↓
CDN (static assets)
   ↓
Load Balancer
   ↓
App Servers (stateless) ← Multiple instances
   ↓
PostgreSQL (primary + replicas)
   ↓
Redis (cache, queue)
   ↓
S3 (file storage)
```

- [ ] Multiple app server instances
- [ ] Load balancer distributes traffic
- [ ] Stateless app servers
- [ ] Database replication/backup
- [ ] Redis persistence enabled
- [ ] Logs aggregated to central service
- [ ] Metrics collected (CPU, Memory, Disk, Latency)
- [ ] Health checks on app servers
- [ ] Automated failover configured
- [ ] Disaster recovery plan documented

#### Monitoring & Alerting
- [ ] Application metrics collected (request rate, latency, errors)
- [ ] Infrastructure metrics collected (CPU, Memory, Disk)
- [ ] Database metrics collected (connections, query time, lock wait)
- [ ] Alerts configured for anomalies
- [ ] On-call rotation defined
- [ ] Incident response procedure documented

**Red Flags:**
- Single point of failure
- No database backups
- No monitoring
- Manual failover process
- No alerting

---

## 3. Architectural Trade-Offs & Decision Recording

### 3.1 Decision Template

Every significant architectural decision must be recorded.

```markdown
## Architecture Decision Record (ADR) — [Number]

### Title
[Brief title of decision]

### Status
Proposed | Accepted | Deprecated | Superseded

### Context
[What problem are we solving?]
[Why is this important?]
[Constraints?]

### Decision
[What we decided]
[Why this option over others]

### Consequences
✅ Advantages:
- [Benefit 1]
- [Benefit 2]

❌ Disadvantages:
- [Tradeoff 1]
- [Tradeoff 2]

### Alternatives Considered
1. [Option A] — Rejected because [reason]
2. [Option B] — Rejected because [reason]

### Related Decisions
- ADR-001: Related to [topic]
- ADR-003: Depends on [topic]
```

### 3.2 Example ADRs

**ADR-001: Single Database for All Tenants (Shared Schema)**

```
Context:
- Need to support thousands of institutions (tenants)
- Scalability requirement: millions of concurrent users
- Billing model: per-tenant subscription

Decision:
- Use single PostgreSQL database with shared schema
- Every tenant-scoped table has tenant_id column
- Every query filters by tenant_id

Consequences:
✅ Advantages:
- Simpler operational model (one DB to manage)
- Easier backups and recovery
- Easier to run reports across tenants
- Lower infrastructure cost

❌ Disadvantages:
- Requires discipline (tenant_id filters mandatory)
- Performance: all tenants compete for same resources
- Scaling limit: single DB can't scale infinitely
- Security risk if tenant_id filter missing

Alternatives:
- Separate database per tenant: Rejected (operational complexity)
- Separate schema per tenant: Rejected (query complexity)

Migration Path:
For future scaling, can migrate to per-tenant DBs later
(not supported in MVP)
```

---

## 4. Architecture Review Workflow

### 4.1 When to Trigger Architecture Review

1. **Before Feature Design** — Review new major feature
2. **Before Implementation** — Review proposed solution architecture
3. **On Technology Choice** — Review new tool/framework
4. **On Performance Issue** — Review for scalability improvement
5. **On Architectural Drift** — Review to realign with principles

### 4.2 Architecture Review Process

**Step 1: Prepare Architecture Document**
- System diagram (draw.io or Miro)
- Component descriptions
- Data flow diagram
- Technology stack
- Scaling plan
- Trade-off justification

**Step 2: Run Review**
- Check against all dimensions (Section 2)
- Document findings
- Identify risks
- Suggest improvements

**Step 3: Decision Recording**
- Create ADR if significant decision
- Document trade-offs
- Track alternatives considered

**Step 4: Approval**
- Architecture lead approves
- Recorded in git
- Communicated to team

---

## 5. Architecture Review Checklist

```markdown
## Architecture Review: [Feature/Module Name]

### Status: ✅ PASS | ⚠️  CONDITIONAL PASS | ❌ FAIL

### System Architecture
- [ ] Clear module boundaries
- [ ] No circular dependencies
- [ ] Cross-module communication via APIs only
- [ ] Shared infrastructure identified

### Domain Design
- [ ] Modules organized by business domain
- [ ] Single responsibility per module
- [ ] Clear public interfaces
- [ ] No implementation leakage

### Layered Architecture
- [ ] Clean separation of layers
- [ ] Dependencies point inward only
- [ ] Controllers have no business logic
- [ ] Services don't query DB directly

### Multi-Tenancy
- [ ] tenant_id in all tenant-scoped tables
- [ ] tenant_id from JWT, never from request
- [ ] All queries filter by tenant_id
- [ ] Database constraints enforce isolation

### API Design
- [ ] RESTful endpoints
- [ ] Consistent request/response format
- [ ] Proper HTTP status codes
- [ ] Error handling

### Async Processing
- [ ] Long operations queued
- [ ] Job idempotency verified
- [ ] Retry logic implemented
- [ ] Dead letter queue configured

### Caching
- [ ] Cache strategy documented
- [ ] Appropriate TTLs
- [ ] Invalidation strategy
- [ ] No unbounded growth

### Security
- [ ] Authentication flow defined
- [ ] Authorization checks in place
- [ ] Data protection layers
- [ ] No sensitive data exposed

### Error Handling
- [ ] Custom exception types
- [ ] Graceful degradation
- [ ] Circuit breaker for external APIs
- [ ] Logging strategy

### Infrastructure
- [ ] Stateless app servers
- [ ] Load balancing
- [ ] Database replication
- [ ] Monitoring & alerting

### Findings
[List of issues found]

### Recommendations
[Ordered by priority]

### Approved By
[Architect]
Date: YYYY-MM-DD
```

---

## 6. Anti-Patterns to Avoid

### 6.1 Monolithic God Class

```javascript
// ❌ WRONG: One class doing everything
class ExamManager {
  createExam() { ... }
  updateExam() { ... }
  deleteExam() { ... }
  submitExam() { ... }
  calculateScore() { ... }
  releaseResult() { ... }
  sendNotification() { ... }
  generateReport() { ... }
  // ... 50+ methods
}

// ✅ CORRECT: Separated by responsibility
class ExamService { /* exam management */ }
class ScoreCalculationService { /* scoring */ }
class ResultReleaseService { /* result logic */ }
class NotificationService { /* notifications */ }
class ReportService { /* reporting */ }
```

### 6.2 Circular Dependencies

```javascript
// ❌ WRONG: Circular dependency
// ExamService depends on StudentService
class ExamService {
  constructor(studentService) { }
}

// StudentService depends on ExamService
class StudentService {
  constructor(examService) { }
}

// ✅ CORRECT: Extract shared responsibility
class TenantsService { /* shared */ }
class ExamService { }
class StudentService { }
```

### 6.3 Database Bypass (Cross-Module Direct Access)

```javascript
// ❌ WRONG: Direct database access across modules
// ExamController queries result DB directly
app.get('/api/exams/:id', async (req, res) => {
  const results = await prisma.result.findMany({ where: { exam_id: req.params.id } });
  res.json(results);
});

// ✅ CORRECT: Via service
class ExamService {
  constructor(resultRepository) { }
  
  async getExamWithResults(examId) {
    return this.resultRepository.findByExam(examId);
  }
}
```

### 6.4 Tight Coupling to External Services

```javascript
// ❌ WRONG: Tightly coupled to WhatsApp API
class NotificationService {
  async notify(phone, message) {
    return whatsappAPI.send(phone, message);
  }
}

// ✅ CORRECT: Abstracted interface
class NotificationService {
  constructor(notificationProvider) {
    this.provider = notificationProvider; // WhatsApp, SMS, Email
  }
  
  async notify(phone, message) {
    return this.provider.send(phone, message);
  }
}
```

### 6.5 Leaky Abstraction

```javascript
// ❌ WRONG: Repository exposes database details
class ExamRepository {
  async find(options) {
    return db.query('SELECT * FROM exams WHERE ...', options);
  }
}

// ✅ CORRECT: Repository hides implementation
class ExamRepository {
  async findByTenant(tenantId) {
    return prisma.exam.findMany({ where: { tenant_id: tenantId } });
  }
  
  async findById(id) {
    return prisma.exam.findUnique({ where: { id } });
  }
}
```

---

## 7. Architecture Review Sign-Off

This document defines the mandatory architecture review protocol for EduOMR.

**No architectural decision is accepted without:**
1. ✅ System architecture clearly defined
2. ✅ Compliance with architecture principles
3. ✅ Multi-tenancy properly designed
4. ✅ Clean architecture enforced
5. ✅ Scalability verified
6. ✅ Trade-offs documented
7. ✅ No anti-patterns detected
8. ✅ ADR recorded (if significant)

---

## Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-13 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved after review — Prisma alignment confirmed, all 10 dimensions validated |

---

## Approval Sign-Off

**Document:** DOC 0.9 — AI Architecture Reviewer  
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Architect | opencode | 2026-07-14 | ✅ Approved |

---

**Next:** After approval, proceed to DOC 0.10 — AI UI/UX Reviewer
