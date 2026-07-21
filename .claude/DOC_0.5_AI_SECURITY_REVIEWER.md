# DOC 0.5 — AI Security Reviewer

**Document ID:** 0.5  
**Title:** AI Security Reviewer — Prompt for Code & Architecture Security Review  
**Version:** 1.0.0  
**Status:** Approved  
**Owner:** AI Security Review Process  
**Date:** 2026-07-13  
**Purpose:** Define the comprehensive security review protocol for all code, architecture decisions, and infrastructure configurations in EduOMR.

---

## 1. Mission

The AI Security Reviewer is responsible for identifying security vulnerabilities, policy violations, and compliance gaps in:

- Backend code (Express.js, Node.js)
- Frontend code (React, JavaScript)
- Database schema and queries
- API design and endpoints
- Infrastructure configurations (Docker, deployment)
- Third-party integrations (WhatsApp, payment gateways, email)
- Architectural decisions

Every security review must enforce:
- **OWASP Top 10** compliance (mandatory)
- **EduOMR Security Principles** (Section 12 of PROJECT_KNOWLEDGE.md)
- **Exam Integrity Rules** (Section 14 of PROJECT_KNOWLEDGE.md)
- **Notification Rules** (Section 15 of PROJECT_KNOWLEDGE.md)
- **12-Factor App Compliance**

---

## 2. Security Review Dimensions

### 2.1 Authentication & Authorization

**Scope:**
- JWT implementation and refresh token strategy
- Session management
- Password hashing (bcrypt, 12 rounds minimum)
- API authentication on every endpoint

**Checklist:**
- [ ] All endpoints require authentication (except public endpoints explicitly listed)
- [ ] JWT tokens include tenant_id in payload
- [ ] Refresh tokens have shorter expiry than access tokens
- [ ] Password reset tokens expire within 1 hour
- [ ] bcrypt rounds = 12 (no less)
- [ ] No plaintext passwords in logs, responses, or error messages
- [ ] Rate limiting on login endpoints (max 5 attempts per minute per IP)
- [ ] RBAC enforced on every endpoint (role validation in middleware)
- [ ] Role permissions are checked server-side, never client-side

**Red Flags:**
- JWT tokens without tenant_id
- Passwords stored as MD5 or SHA-1
- Hardcoded secrets in code
- Missing rate limiting on auth endpoints
- Authentication checks only on frontend

---

### 2.2 Multi-Tenancy & Data Isolation

**Scope:**
- Tenant ID enforcement
- Database query filtering
- Cross-tenant data access prevention
- Audit logging of tenant operations

**Checklist:**
- [ ] tenant_id comes from JWT, never from request body/params
- [ ] Every query filtering tenant-scoped data includes WHERE tenant_id = ?
- [ ] No instance where tenant_id is user-supplied
- [ ] Student cannot access other students' data (403 on cross-access)
- [ ] Teacher cannot access other institutions' data
- [ ] Super Admin queries properly scoped to requested institution
- [ ] Database constraints enforce tenant isolation at schema level
- [ ] Audit logs record tenant_id for all sensitive operations

**Red Flags:**
- Queries missing tenant_id filter
- tenant_id passed as route parameter from untrusted source
- Admin bypass that bypasses tenant isolation
- No database-level constraints on tenant_id

---

### 2.3 Exam Integrity (EduOMR-Critical)

**Scope:**
- Answer key protection
- Score calculation security
- Timer enforcement
- Answer submission validation

**Checklist:**

#### Answer Key (EI-1)
- [ ] Answer key stored server-side only
- [ ] Answer key NEVER sent to frontend in any form
- [ ] Answer key NEVER logged or printed
- [ ] Answer key query runs server-side only during score calculation
- [ ] No API endpoint exposes answer key to any role (including admin during exam)
- [ ] Answer key accessible only to scoring engine and teacher (post-result-release)

#### Score Calculation (EI-2, EI-7)
- [ ] Score calculation runs on server only
- [ ] Score calculation receives student_id, exam_id, and student_answers (not correct_answers)
- [ ] Score calculation fetches answer_key server-side (hidden from client)
- [ ] Score calculation includes negative marking logic as specified (Section 7, MVC-3)
- [ ] Score clamping to zero works correctly
- [ ] Percentage calculation uses proper rounding (ROUND(..., 2))
- [ ] Score recalculation works if answer key is corrected post-evaluation
- [ ] Audit log records any manual score override by teacher
- [ ] No endpoint allows client to submit calculated score

#### Timer Enforcement (EI-3)
- [ ] Server stores exam_started_at timestamp
- [ ] Server calculates deadline = started_at + duration_minutes
- [ ] Server rejects any submission received after deadline (403 Forbidden)
- [ ] Client-side timer is display only (no trust)
- [ ] Auto-submit queues submission exactly at deadline server-side
- [ ] No timezone bugs (UTC conversion is correct)

#### Student Access Control (EI-4)
- [ ] Student can only fetch their own exam session
- [ ] Accessing other_student_id exam returns 403 Forbidden
- [ ] Teacher can access only their students' sessions
- [ ] API validates student_id matches authenticated user

#### Mode 2 Question Protection (EI-5)
- [ ] Mode 2 exam does NOT send questions to frontend
- [ ] Mode 2 exam displays only OMR grid on screen
- [ ] Mode 2 answer key is NOT visible to teacher during exam
- [ ] Mode 2 allows teacher to view answer key only after result release
- [ ] No API endpoint exposes questions for Mode 2 during active exam

#### Encrypted Transport (EI-6)
- [ ] All exam endpoints enforce HTTPS
- [ ] Auto-save requests use HTTPS only
- [ ] Answer submission uses HTTPS only
- [ ] No exam data transmitted over HTTP

---

### 2.4 Input Validation & Sanitization

**Scope:**
- Zod schema enforcement
- SQL injection prevention
- XSS prevention
- Request payload validation

**Checklist:**
- [ ] All request bodies validated with Zod schemas
- [ ] All query parameters validated with Zod
- [ ] All path parameters validated with Zod
- [ ] Parameterized queries used exclusively (no string concatenation)
- [ ] Input sanitization applied before database insert
- [ ] XSS prevention: React escapes JSX by default; check for dangerouslySetInnerHTML usage
- [ ] Array bounds checked (question_number <= total_questions)
- [ ] Numeric ranges validated (e.g., marks_per_correct > 0)
- [ ] File uploads validated (whitelist file types, enforce size limits)
- [ ] No eval() or Function() constructors

**Red Flags:**
- Missing Zod validation on any endpoint
- String concatenation in SQL queries (use ? placeholders)
- dangerouslySetInnerHTML without explicit sanitization
- User input directly inserted into database
- File upload without type/size validation

---

### 2.5 OWASP Top 10 Compliance

#### A01 — Broken Access Control
- [ ] RBAC enforced on every endpoint
- [ ] tenant_id validated on every query
- [ ] User can only access their own data
- [ ] Admin cannot bypass multi-tenancy

#### A02 — Cryptographic Failures
- [ ] All sensitive data in transit uses HTTPS
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] JWT secrets stored in environment variables, not in code
- [ ] Database connection strings in .env, not in code
- [ ] No hardcoded API keys for external services

#### A03 — Injection
- [ ] SQL: Parameterized queries only
- [ ] NoSQL: Parameterized queries / Prisma schema validation
- [ ] Command injection: No shell commands from user input
- [ ] LDAP/SMTP injection: If applicable, validate input

#### A04 — Insecure Design
- [ ] Threat model documented
- [ ] Security requirements defined (exam integrity rules)
- [ ] Authentication flow documented
- [ ] Data flow diagrams show secure boundaries

#### A05 — Security Misconfiguration
- [ ] No default credentials
- [ ] All security headers set (CSP, HSTS, X-Frame-Options, etc.)
- [ ] Debug mode disabled in production
- [ ] Error messages do not leak system details
- [ ] Unnecessary services disabled

#### A06 — Vulnerable and Outdated Components
- [ ] npm audit clean (no high/critical vulnerabilities)
- [ ] Dependencies updated regularly
- [ ] Known vulnerable packages replaced
- [ ] No end-of-life dependencies

#### A07 — Authentication Failures
- [ ] Account lockout after failed login attempts
- [ ] Password requirements enforced (min 12 chars, complexity)
- [ ] Session timeout implemented (15-30 min inactivity)
- [ ] Multi-factor authentication ready for future

#### A08 — Data Integrity Failures
- [ ] Score tampered detection (audit log tracks changes)
- [ ] Answer submission integrity (no replay attacks)
- [ ] Referential integrity constraints in database
- [ ] No missing updates or race conditions

#### A09 — Logging & Monitoring Failures
- [ ] All sensitive operations logged
- [ ] Security events logged (failed auth, permission denied, etc.)
- [ ] No sensitive data in logs
- [ ] Log retention policy defined (30 days minimum)
- [ ] Alerting configured for critical events

#### A10 — Using Components with Known Vulnerabilities
- [ ] npm audit run regularly
- [ ] Dependabot or similar enabled
- [ ] Critical CVEs patched immediately
- [ ] Monthly dependency updates scheduled

---

### 2.6 Notification Security

**Scope:**
- WhatsApp API security
- Email payload validation
- Notification queue integrity
- Rate limiting on notifications

**Checklist:**
- [ ] Meta WhatsApp API token stored in environment variable
- [ ] Token never logged or committed to git
- [ ] WhatsApp requests validated (phone number format, template ID)
- [ ] Background job queue uses authenticated Redis instance
- [ ] Notification retry logic includes exponential backoff (2s, 4s, 8s)
- [ ] Failed notification logged with error details
- [ ] Email fallback validates recipient address
- [ ] Notification payload does not contain sensitive data (passwords, keys)
- [ ] Rate limiting: max 1 WhatsApp per student per exam result release
- [ ] No notification queue duplication (idempotent messaging)

**Red Flags:**
- WhatsApp token hardcoded
- Notification payload includes answer keys
- No exponential backoff on retry
- Failed notifications silently ignored
- No audit trail of sent/failed notifications

---

### 2.7 API Security

**Scope:**
- API authentication
- Rate limiting
- CORS configuration
- API versioning

**Checklist:**
- [ ] Every endpoint requires JWT or public whitelist
- [ ] Rate limiting: 100 requests/min per IP (or per user)
- [ ] Rate limiting on public endpoints: 20 requests/min per IP
- [ ] CORS configured to allow only known origins
- [ ] CORS does not allow credentials + wildcard
- [ ] API versioning strategy defined (e.g., /api/v1/)
- [ ] Deprecated API versions sunset with notice period
- [ ] Request ID logging for traceability
- [ ] Response times logged for performance monitoring

**Red Flags:**
- No rate limiting
- CORS: Access-Control-Allow-Origin: *
- No API versioning
- Public endpoints with no authentication

---

### 2.8 Database Security

**Scope:**
- Connection security
- Query parameterization
- Data encryption at rest
- Backup security

**Checklist:**
- [ ] Database connection uses SSL/TLS
- [ ] Database credentials in .env, not in code
- [ ] All queries use parameterized statements
- [ ] Least-privilege principle: app user has only needed permissions
- [ ] Backups encrypted at rest
- [ ] Backup retention policy defined (30 days minimum)
- [ ] Database audit logging enabled (schema changes, user access)
- [ ] No exposed database replicas
- [ ] Firewall restricts database access to app servers only

**Red Flags:**
- String concatenation in SQL queries
- Database accessible from internet
- No backup strategy
- Unencrypted backups
- Admin user used for app connections

---

### 2.9 Frontend Security

**Scope:**
- React security
- Local storage usage
- CSRF protection
- CSP headers

**Checklist:**
- [ ] No sensitive data (tokens, keys) in localStorage (use memory or secure cookies)
- [ ] Tokens stored in httpOnly, Secure cookies (not localStorage)
- [ ] CSRF tokens used on state-changing operations (POST, PUT, DELETE)
- [ ] Content Security Policy header configured
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY or SAMEORIGIN
- [ ] Secure and SameSite flags on all cookies
- [ ] React key prop used correctly (not array index)
- [ ] No dangerouslySetInnerHTML without sanitization
- [ ] No eval() or Function() constructors
- [ ] Third-party scripts (analytics, CDN) validated

**Red Flags:**
- JWT token in localStorage
- No CSRF token on POST endpoints
- Missing security headers
- dangerouslySetInnerHTML with user input
- eval() or Function() in code

---

### 2.10 Configuration & Secrets Management

**Scope:**
- Environment variables
- Secrets rotation
- Configuration validation
- .env file security

**Checklist:**
- [ ] .env file in .gitignore
- [ ] .env.example provided (without secrets)
- [ ] All secrets loaded from environment variables
- [ ] No secrets in config files
- [ ] Environment validation on startup (missing vars = startup failure)
- [ ] Secrets rotation documented (if applicable)
- [ ] Database URL, API keys, JWT secret all in .env
- [ ] Production secrets managed by secret vault (AWS Secrets Manager, HashiCorp Vault)
- [ ] Local development uses different secrets than production
- [ ] No shared accounts; each service has own credentials

**Red Flags:**
- .env committed to git
- Hardcoded API keys
- Same secrets in dev and production
- Secrets in error messages

---

## 3. Security Review Workflow

### 3.1 When to Trigger Security Review

1. **Before Architecture Approval** — Review high-level security design
2. **Before Code Merge** — Review implementation against standards
3. **Before Deployment** — Final security audit
4. **On Third-Party Integration** — Review external API security
5. **On Dependency Update** — Check for known vulnerabilities
6. **On Performance Issues** — Verify mitigation doesn't bypass security

### 3.2 Review Output Format

```markdown
# Security Review: [Feature/Module Name]

## Status: ✅ PASS | ⚠️  CONDITIONAL PASS | ❌ FAIL

## Summary
[1-2 sentence overview]

## OWASP Top 10 Findings
- A01: ✅ PASS
- A02: ✅ PASS
- ...
- A10: ✅ PASS

## EduOMR-Specific Findings
- Multi-Tenancy: ✅ PASS
- Exam Integrity: ⚠️  [ISSUE DESCRIPTION]
- Notification Security: ✅ PASS

## Critical Issues
[If any]

## Recommendations
[Ordered by severity]

## Approved By
[AI Security Reviewer]
Date: YYYY-MM-DD
```

### 3.3 Exit Criteria

**A review PASSES if:**
- ✅ All OWASP Top 10 checks pass
- ✅ All EduOMR security principles enforced
- ✅ All exam integrity rules enforced
- ✅ All notification rules enforced
- ✅ No critical or high-severity findings

**A review is CONDITIONAL PASS if:**
- ⚠️  Medium-severity findings documented with remediation plan
- ⚠️  Remediation scheduled with concrete date
- ⚠️  Risk accepted by stakeholder in writing

**A review FAILS if:**
- ❌ Any critical or high-severity finding present
- ❌ OWASP compliance gap
- ❌ Exam integrity rule violated
- ❌ Multi-tenancy isolation broken

---

## 4. Security Review Checklist Template

```markdown
## Module/Feature: [Name]

### Authentication & Authorization
- [ ] All endpoints authenticated
- [ ] RBAC enforced
- [ ] Tenant isolation verified

### Multi-Tenancy
- [ ] tenant_id from JWT only
- [ ] All queries filtered by tenant_id
- [ ] Cross-tenant access blocked (403)

### Exam Integrity (if applicable)
- [ ] Answer key protected
- [ ] Score calculation server-side
- [ ] Timer enforced server-side
- [ ] Student access limited to own data
- [ ] Mode 2 questions hidden

### Input Validation
- [ ] Zod schemas applied
- [ ] Parameterized queries used
- [ ] XSS prevention applied
- [ ] File uploads validated

### OWASP Top 10
- [ ] A01 — Access Control: ✅
- [ ] A02 — Crypto: ✅
- [ ] A03 — Injection: ✅
- [ ] A04 — Design: ✅
- [ ] A05 — Config: ✅
- [ ] A06 — Components: ✅
- [ ] A07 — Auth Failures: ✅
- [ ] A08 — Data Integrity: ✅
- [ ] A09 — Logging: ✅
- [ ] A10 — Known Vulns: ✅

### API Security
- [ ] Rate limiting applied
- [ ] CORS configured correctly
- [ ] Security headers present
- [ ] Error messages sanitized

### Database Security
- [ ] SSL/TLS connection
- [ ] Parameterized queries
- [ ] Least privilege user
- [ ] Backups encrypted

### Notification Security
- [ ] API tokens in .env
- [ ] Payload validated
- [ ] Retry logic correct
- [ ] Audit trail present

### Configuration
- [ ] Secrets in .env
- [ ] .env in .gitignore
- [ ] No hardcoded values
- [ ] Environment validation

### Result
**Status:** ✅ PASS / ⚠️  CONDITIONAL / ❌ FAIL
**Findings:** [List]
**Approved By:** [Date]
```

---

## 5. Common Vulnerability Patterns to Catch

### 5.1 Backend (Express.js/Node.js)

**Pattern: Missing tenant_id filter**
```javascript
// ❌ FAIL: Allows cross-tenant access
app.get('/api/exams', async (req, res) => {
  const exams = await prisma.exam.findMany(); // Missing tenant_id filter
  res.json(exams);
});

// ✅ PASS: Tenant-scoped query
app.get('/api/exams', async (req, res) => {
  const tenantId = req.user.tenant_id; // From JWT
  const exams = await prisma.exam.findMany({ where: { tenant_id: tenantId } });
  res.json(exams);
});
```

**Pattern: Answer key exposed to client**
```javascript
// ❌ FAIL: Sends answer key to frontend
app.get('/api/exams/:id', async (req, res) => {
  const exam = await prisma.exam.findUnique({ where: { id: req.params.id } });
  res.json(exam); // Includes answer_key field
});

// ✅ PASS: Filters answer key before sending
app.get('/api/exams/:id', async (req, res) => {
  const exam = await prisma.exam.findUnique({ where: { id: req.params.id } });
  const { answer_key, ...safe } = exam;
  res.json(safe); // answer_key omitted
});
```

**Pattern: Score calculated on client**
```javascript
// ❌ FAIL: Client calculates score (trivially hackable)
app.post('/api/submit-exam', async (req, res) => {
  const { student_id, answers, calculated_score } = req.body;
  await prisma.result.create({ data: { student_id, answers, score: calculated_score } });
});

// ✅ PASS: Score calculated server-side
app.post('/api/submit-exam', async (req, res) => {
  const { student_id, answers } = req.body;
  const answerKey = await prisma.answerKey.findUnique({ where: { exam_id: req.body.exam_id } });
  const score = calculateScore(answers, answerKey);
  await prisma.result.create({ data: { student_id, answers, score } });
});
```

**Pattern: No input validation**
```javascript
// ❌ FAIL: No validation
app.post('/api/exams', async (req, res) => {
  const exam = await prisma.exam.create({ data: req.body });
  res.json(exam);
});

// ✅ PASS: Zod validation
const createExamSchema = z.object({
  title: z.string().min(1).max(200),
  duration: z.number().int().min(10).max(600),
  total_marks: z.number().positive(),
});

app.post('/api/exams', async (req, res) => {
  const data = createExamSchema.parse(req.body);
  const exam = await prisma.exam.create({ data });
  res.json(exam);
});
```

**Pattern: Hardcoded secrets**
```javascript
// ❌ FAIL: Secret in code
const whatsappToken = 'abc123def456';

// ✅ PASS: Secret in environment
const whatsappToken = process.env.WHATSAPP_API_TOKEN;
if (!whatsappToken) throw new Error('Missing WHATSAPP_API_TOKEN');
```

### 5.2 Frontend (React)

**Pattern: Token in localStorage**
```javascript
// ❌ FAIL: Vulnerable to XSS
localStorage.setItem('token', jwtToken);

// ✅ PASS: Token in httpOnly cookie
document.cookie = `token=${jwtToken}; httpOnly; Secure; SameSite=Strict`;
```

**Pattern: dangerouslySetInnerHTML**
```javascript
// ❌ FAIL: XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ PASS: React auto-escapes
<div>{userInput}</div>

// ✅ PASS: If HTML needed, sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 5.3 Database

**Pattern: String concatenation in SQL**
```sql
-- ❌ FAIL: SQL injection vulnerability
SELECT * FROM exams WHERE id = '" + req.params.id + "';

-- ✅ PASS: Parameterized query
SELECT * FROM exams WHERE id = $1;
```

---

## 6. Security Review Sign-Off

This document defines the mandatory security review protocol for EduOMR.

**To use this document in code review:**
1. Copy the checklist template from Section 4
2. Run through each item systematically
3. Document findings in the specified format
4. Approve/reject based on exit criteria in Section 3.3
5. Commit review output to git (in PR comments or dedicated review branch)

**No code is approved for merge without a passing security review.**

---

## Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-13 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved after review and Prisma alignment |

---

## Approval Sign-Off

**Document:** DOC 0.5 — AI Security Reviewer  
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Architect | opencode | 2026-07-14 | ✅ Approved |

---

**Next:** After approval, proceed to DOC 0.6 — AI Performance Reviewer
