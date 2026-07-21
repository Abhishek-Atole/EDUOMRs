# DOC 2.5 — Security Architecture

**Document ID:** 2.5
**Title:** Security Architecture — Authentication, Authorization, Encryption, Compliance
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Engineering
**Date:** 2026-07-15
**Purpose:** Define the complete security architecture — identity management, access control, data protection, network security, and compliance controls.

---

## 1. Security Principles

| Principle | Guideline |
|---|---|
| Defense in Depth | Multiple security layers — network, application, data |
| Least Privilege | Every user/process gets minimum permissions required |
| Zero Trust | Verify every request — never trust network location |
| Secure by Default | Security opt-OUT, never opt-IN |
| Encryption Everywhere | TLS in transit, AES-256 at rest |
| Audit Everything | Log all access to sensitive data |
| No Secrets in Code | All secrets in environment variables |
| Fail Secure | On error, deny access — never grant |

---

## 2. Authentication Architecture

### 2.1 Credential Flow

```
Client                    Server                         Database
  │                         │                               │
  │  POST /auth/login       │                               │
  │  {email, password}      │                               │
  │────────────────────────>│                               │
  │                         │  SELECT * FROM users          │
  │                         │  WHERE email = ?             │
  │                         │──────────────────────────────>│
  │                         │  user record                  │
  │                         │<──────────────────────────────│
  │                         │                               │
  │                         │  bcrypt.compare()             │
  │                         │                               │
  │                         │  Generate JWT (15min)         │
  │                         │  Generate Refresh Token (7d)  │
  │                         │  Store refresh token hash     │
  │                         │──────────────────────────────>│
  │                         │                               │
  │  {accessToken,          │                               │
  │   refreshToken, user}   │                               │
  │<────────────────────────│                               │
```

### 2.2 JWT Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id",
    "role": "teacher",
    "tenantId": "institution_id",
    "iat": 1721030400,
    "exp": 1721031300
  }
}
```

**Claims:**
- sub: User UUID
- role: User role string
- tenantId: Institution UUID (null for Platform Owner)
- iat: Issued at (epoch seconds)
- exp: Expiry (900 seconds = 15 minutes)

### 2.3 Account Lockout

```
5 failed attempts → 15-minute lockout
10 total failed attempts (cumulative) → account disabled until admin reset
```

---

## 3. Authorization (RBAC)

### 3.1 Permission Matrix

| Resource / Action | Platform Owner | Super Admin | Inst. Admin | Teacher | Student | Parent |
|---|---|---|---|---|---|---|
| Institutions CRUD | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Users CRUD (tenant) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Exams CRUD | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Questions CRUD | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Start Exam | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Submit Exam | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| View Own Result | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View All Results | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Release Result | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Payments | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Analytics | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Child Results | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 3.2 RBAC Middleware Chain

```javascript
// Route definition
router.post('/exams/:id/release-results',
  authenticate,          // 1. Verify JWT
  authorize('teacher'),  // 2. Role check
  tenantGuard,           // 3. Tenant scope
  subscriptionGuard,     // 4. Active subscription
  examOwnerGuard,        // 5. Owns the exam
  examController.releaseResults
);
```

### 3.3 Role Hierarchy (Future)

```
platform_owner
  └── super_admin
        └── admin
              └── teacher
```

---

## 4. Exam Integrity Security

### 4.1 Answer Key Protection

```
Storage:
  - answer_keys table: encrypted at rest
  - correct_option in questions: only accessible by teacher roles

Transmission:
  - NEVER sent to student browser
  - NEVER included in exam session response
  - Teacher questions endpoint: requires teacher+ role

Score Calculation:
  - Runs on server ONLY
  - Client never computes or receives raw answer key
```

### 4.2 Exam Session Enforcement

```javascript
// Server-side checks on every answer save
async function validateSessionAccess(userId, sessionId) {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId }
  });

  // EI-4: Student can only access their own session
  if (session.studentId !== userId) {
    throw new ForbiddenError('Session does not belong to you');
  }

  // EI-3: Server-enforced deadline
  const exam = await prisma.exam.findUnique({
    where: { id: session.examId }
  });

  if (new Date() > new Date(exam.deadlineAt)) {
    await autoSubmitSession(sessionId);
    throw new ExamExpiredError('Exam deadline passed');
  }

  // EI-1: Answer key never leaks
  // (intentionally omitted from return)
}
```

### 4.3 Mode 2 (Physical Paper) Enforcement

```javascript
// Exam session start — Mode 2
if (exam.examMode === 'PHYSICAL_PAPER') {
  return {
    sessionId,
    examTitle,
    durationMinutes,
    deadlineAt,
    questions: [],   // EI-5: Never transmitted
    totalQuestions,
    bannerText: 'Answer according to your physical question paper'
  };
}
```

### 4.4 Anti-Cheating Measures

| Measure | Implementation |
|---|---|
| Tab switch detection | Client-side event listener (frontend) |
| Session timeout | Server-enforced deadline — hard cut |
| Single session | UNIQUE(exam_id, student_id) constraint |
| IP logging | Every session start logs IP address |
| Answer audit trail | All answers timestamped + versioned |

---

## 5. Data Encryption

### 5.1 In Transit

| Layer | Protocol |
|---|---|
| Client → API | TLS 1.3 (min 1.2) |
| API → Database | TLS (PostgreSQL sslmode=require) |
| API → Redis | TLS (if external) |
| API → Bull/Redis | AUTH + TLS |
| Internal services | mTLS (future: service mesh) |

### 5.2 At Rest

| Data Store | Encryption |
|---|---|
| PostgreSQL | AES-256 (TDE via cloud provider or pg_tde) |
| Redis | No persistent storage (volatile) |
| File uploads | AES-256 encryption before S3/disk write |
| Backups | AES-256 encryption |

### 5.3 Sensitive Fields

| Field | Protection |
|---|---|
| password_hash | bcrypt (12 rounds) — never reversible |
| refresh_token | SHA-256 hash stored, raw only returned once |
| password_reset_token | SHA-256 hash stored |
| JWT secret | 512-bit random — env var only |
| DB credentials | Env var only — never in code |

---

## 6. API Security

### 6.1 Rate Limiting

```javascript
const rateLimitConfig = {
  global:      { window: 60000, max: 1000 },  // 60s, 1000 req
  auth:        { window: 60000, max: 10 },     // 60s, 10 req
  answers:     { window: 60000, max: 60 },     // 60s, 60 req per session
  examStart:   { window: 60000, max: 5 }       // 60s, 5 starts
};
```

### 6.2 Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()
```

### 6.3 Input Validation

```
All input → Zod schema validation at controller boundary
  └── Reject unknown fields (strip: false, strict: true)
  └── Sanitize strings (strip HTML tags)
  └── Validate UUID format for all ID params
  └── Maximum payload size: 1MB (JSON)
```

---

## 7. Multi-Tenancy Security

### 7.1 Tenant Isolation

| Layer | Isolation |
|---|---|
| Database | Shared schema — tenant_id on every table |
| Query | ALL queries include WHERE tenant_id = ? |
| JWT | tenantId extracted from token — never from request |
| Cache | Redis keys prefixed with tenant_id |
| File Storage | S3/disk paths prefixed with tenant_id |

### 7.2 Cross-Tenant Prevention

```javascript
// ❌ NEVER — tenant_id from request body
const { tenantId } = req.body;

// ✅ ALWAYS — tenant_id from authenticated JWT
const tenantId = req.user.tenantId;

// Repository layer enforces tenant scope
async function findExamById(id, tenantId) {
  return prisma.exam.findFirst({
    where: {
      id,
      tenant_id: tenantId,   // Mandatory
      deleted_at: null
    }
  });
}
```

### 7.3 Super Admin Cross-Tenant Access

```
Super Admin:
  - JWT has tenantId = null (super admin scope)
  - Separate admin service with full audit
  - Every cross-tenant action logged to audit_logs
  - Cannot impersonate tenant users
  - Can only access via /api/v1/admin/* routes
```

---

## 8. Notification Security

### 8.1 WhatsApp API Credentials

```
Storage:
  - META_APP_ID, META_APP_SECRET, META_WEBHOOK_TOKEN, 
    META_PHONE_NUMBER_ID — all in .env
  - Never stored in database or code
  - Rotated every 90 days
```

### 8.2 Data Minimization

```
Notifications send only:
  - Student name (first_name only)
  - Parent name (first_name only)
  - Score, total marks, rank, total students
  
Never transmitted over WhatsApp:
  - Student ID, parent ID, email
  - Exam answers or answer key
  - Per-question breakdown
```

---

## 9. Logging & Monitoring

### 9.1 Security Events (Audit Log)

| Event | Logged Fields |
|---|---|
| Login success | userId, IP, timestamp, user-agent |
| Login failure | email/IP, timestamp, attempt count |
| Password change | userId, timestamp |
| Result release | userId, examId, resultCount, timestamp |
| Cross-tenant access | adminUserId, tenantId, action, timestamp |
| Payment verify | adminUserId, paymentId, action, timestamp |
| Account lockout | userId, IP, timestamp |
| Exam submission | sessionId, duration_seconds, timestamp |

### 9.2 Alert Thresholds

| Condition | Action |
|---|---|
| 10+ failed logins in 5 min | Email alert to admin |
| 100+ exam starts in 1 min | Slack/email alert |
| Cross-tenant access attempt by non-admin | Immediate security alert |
| Notification dead-letter queue > 50 | Platform Owner alert |
| Payment verification by non-Super Admin | Immediate security alert |

---

## 10. Compliance

### 10.1 Data Retention

| Data Type | Retention | Rationale |
|---|---|---|
| Exam submissions | Indefinite | Academic integrity, disputes |
| Student answers | Indefinite | Per-question breakdown for review |
| Audit logs | 7 years | Legal/compliance |
| Payment records | 7 years | Tax/compliance |
| Notification logs | 1 year | Operational |
| Failed auth attempts | 90 days | Security monitoring |
| Refresh tokens | Until revoked + 30 days | Cleanup |

### 10.2 Student PII Protection

- Student names, phone numbers only accessible to:
  - Their own account
  - Their parents (linked via parent_students)
  - Teachers of enrolled classes
  - Institution Admin
- Phone numbers masked in logs: `+919876****10`
- Email considered PII — never exposed in notification payloads

---

## 11. Incident Response

| Severity | Response Time | Escalation |
|---|---|---|
| Critical (data breach) | 15 minutes | Platform Owner + Engineering Lead |
| High (service down) | 30 minutes | Engineering Lead |
| Medium (feature degraded) | 4 hours | Engineering Team |
| Low (cosmetic) | 24 hours | Normal sprint |

---

## 12. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-15 | Approved | Approved by Founder |

---

## 13. Approval Sign-Off

**Document:** DOC 2.5 — Security Architecture
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-15 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-15 | ✅ Approved |
