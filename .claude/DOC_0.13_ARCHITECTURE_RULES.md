# DOC 0.13 — Architecture Rules

**Document ID:** 0.13  
**Title:** Architecture Rules — Mandatory Structural Rules for EduOMR  
**Version:** 1.0.0  
**Status:** Approved  
**Owner:** Architecture Governance  
**Date:** 2026-07-13  
**Purpose:** Define the non-negotiable architecture rules that every implementation, module, integration, and deployment decision must follow in EduOMR.

---

## 1. Mission

The Architecture Rules document exists to keep EduOMR aligned with its enterprise, multi-tenant, secure, scalable, and modular goals.

**Core Principle:**
> If an implementation violates architecture rules, it is not acceptable, even if it "works."

These rules are mandatory for:
- Backend modules
- Frontend modules
- Database structure
- Queues and background jobs
- API design
- Integration patterns
- Deployment patterns

---

## 2. Non-Negotiable Architecture Principles

### 2.1 Clean Architecture

- Presentation layer depends on application layer
- Application layer depends on domain layer
- Domain layer does not depend on infrastructure
- Infrastructure depends on abstractions, not the other way around

**Rules:**
- Controllers handle HTTP only
- Services handle business logic
- Repositories handle data access
- Domain models hold business meaning
- Shared utilities remain truly shared and generic

### 2.2 Modular Monolith First

MVP architecture must be a modular monolith.

**Rules:**
- One deployable application for MVP
- Clear module boundaries inside the monolith
- No premature microservices
- No direct cross-module database access
- Module communication must go through well-defined interfaces

### 2.3 API First

- Every capability must be accessible through an API
- Frontend must not contain hidden business logic
- API contracts must be documented before implementation
- API responses must be stable and versioned

### 2.4 Multi-Tenancy by Design

- tenant_id is part of the architecture, not an afterthought
- Tenant isolation must exist at repository layer
- Tenant-aware query patterns are mandatory
- tenant_id never comes from user input

### 2.5 Security by Design

- Security controls are built into the architecture
- Answer keys remain server-side only
- Score calculation remains server-side only
- Sensitive data paths are explicitly designed and reviewed

---

## 3. Layer Rules

### 3.1 Presentation Layer Rules

- Controllers or route handlers must not hold business rules
- UI components must not calculate authoritative scores
- UI can display state, not own core logic
- UI should only request data and submit user input

### 3.2 Application Layer Rules

- Services coordinate work
- Services enforce use-case logic
- Services call repositories and infrastructure through abstractions
- Services remain framework-agnostic where possible

### 3.3 Domain Layer Rules

- Domain logic must be independent of HTTP, database, and UI
- Domain entities and policies should be reusable
- Important business rules belong here

### 3.4 Infrastructure Layer Rules

- Database, Redis, queue, email, WhatsApp, PDF, and external APIs live here
- Infrastructure may depend on application contracts
- Infrastructure must not leak implementation details upward

---

## 4. Module Boundary Rules

### 4.1 Domain Modules

Approved core modules:
- Authentication
- Authorization
- Institution Management
- Subscription Management
- Notification Engine
- Academic Structure
- Examination
- Communication
- Settings

### 4.2 Boundary Enforcement

- Each module owns its data access patterns
- No module should reach into another module's database tables directly
- Cross-module access must use exported service contracts or events
- Shared logic belongs in shared infrastructure or a common domain utility only if truly generic

### 4.3 Dependency Direction

- Upper modules may depend on lower abstractions
- Lower layers must not depend on upper layers
- Circular dependencies are forbidden

---

## 5. Database Architecture Rules

### 5.1 Data Ownership

- Each table has a clear owner module
- Shared tables are exceptional, not normal
- Ownership must be documented

### 5.2 Tenant Isolation

- All tenant-scoped tables include tenant_id
- All tenant-scoped queries filter by tenant_id
- Foreign keys should support tenant-safe joins
- Repository layer must enforce tenant constraints automatically where possible

### 5.3 Query Rules

- Use parameterized queries only
- Avoid `SELECT *`
- Avoid N+1 query patterns
- Add indexes for frequent filters
- Keep transaction scope narrow

### 5.4 Migration Rules

- Database migrations must be reviewed
- Breaking schema changes require migration plan
- Destructive migration requires explicit approval
- New columns must consider backfill strategy

---

## 6. API Architecture Rules

- Use resource-oriented endpoints
- Use versioning (`/api/v1/`)
- Keep error formats consistent
- Keep response shapes predictable
- Protect every endpoint with explicit authorization rules
- Public endpoints must be intentionally whitelisted

---

## 7. Background Job Rules

- Long-running work must be queued
- HTTP response must not wait for slow notifications
- Jobs must be idempotent
- Retry policy must be explicit
- Failed jobs must be observable and searchable
- Queue workers must be stateless and restart-safe

---

## 8. Caching Rules

- Cache only when a real performance need exists
- Cache near the repository or service boundary
- Never cache sensitive data unless explicitly approved
- All cache entries require TTL or invalidation strategy
- Cache keys must be namespaced

---

## 9. Integration Rules

### 9.1 WhatsApp Integration

- Use Meta WhatsApp Cloud API only
- Unofficial libraries are forbidden
- External tokens must live in environment variables
- Notification workflow must remain decoupled from result storage

### 9.2 Payment Integration

- Payment flow must support manual verification now
- Architecture must remain provider-agnostic for future gateways
- Gateway-specific logic must be isolated behind interfaces

### 9.3 PDF Integration

- PDF generation must be isolated from core request path
- Large PDFs should be handled asynchronously if possible
- Puppeteer usage must be controlled and monitored

---

## 10. Frontend Architecture Rules

- Frontend state should not become the source of truth for critical rules
- Server remains authoritative for timer, score, result release, and permissions
- React components should remain presentational where possible
- Shared UI primitives must be consistent and reusable
- Exam Mode 2 must not render question content on the client

---

## 11. Deployment Architecture Rules

- MVP stays deployable as a single unit
- App servers must be stateless
- Database, cache, and queue are external services
- Secrets are environment-based
- Logs are centralized
- Scaling must be horizontal-ready

---

## 12. Change Governance Rules

- Any architecture exception must be documented
- Exceptions must have a reason, scope, and expiry or review point
- Architecture changes require review before implementation
- Significant decisions require ADRs

---

## 13. Architecture Review Checklist

```markdown
## Architecture Rules Review: [Feature/Change]

### Layering
- [ ] Presentation layer clean
- [ ] Application layer owns use-case logic
- [ ] Domain layer isolated from infrastructure
- [ ] Infrastructure hidden behind abstractions

### Modules
- [ ] Module boundaries clear
- [ ] No direct cross-module DB access
- [ ] No circular dependencies
- [ ] Responsibility per module is narrow

### Tenancy
- [ ] tenant_id enforced consistently
- [ ] No user-supplied tenant_id accepted
- [ ] Tenant-safe repository patterns used

### Data
- [ ] Query rules followed
- [ ] Migrations reviewed
- [ ] Index strategy considered
- [ ] Transaction scope narrow

### APIs / Jobs / Cache
- [ ] API versioning used
- [ ] Jobs queued where needed
- [ ] Cache strategy defined
- [ ] External integrations isolated

### Result
**Status:** ✅ PASS / ⚠️ CONDITIONAL / ❌ FAIL
```

---

## 14. Forbidden Architecture Patterns

- Big ball of mud architecture
- Business logic in controllers
- Direct database access across modules
- Microservices before MVP need exists
- Tenant isolation as optional logic
- Shared mutable global state for critical flows
- Synchronous notification dispatch in request path

---

## 15. Architecture Rules Sign-Off

This document defines the mandatory structural rules for EduOMR.

**No change is accepted unless:**
1. ✅ It respects layer boundaries
2. ✅ It preserves tenant isolation
3. ✅ It supports scaling and security
4. ✅ It avoids architecture drift
5. ✅ It is reviewed and approved

---

## Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-13 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved after review — all CLAUDE.md rules aligned and validated |

---

## Approval Sign-Off

**Document:** DOC 0.13 — Architecture Rules  
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Architect | opencode | 2026-07-14 | ✅ Approved |

---

**Next:** After approval, proceed to DOC 0.14 — UI/UX Guidelines
