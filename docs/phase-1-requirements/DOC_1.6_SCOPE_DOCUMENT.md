# DOC 1.6 — Scope Document

**Document ID:** 1.6
**Title:** Scope Document — EduOMR MVP Scope & Boundaries
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Product Management
**Date:** 2026-07-14
**Purpose:** Define exactly what is in scope, what is out of scope, and the explicit boundaries for the EduOMR MVP.

---

## 1. Scope Statement

The EduOMR MVP will deliver a multi-tenant SaaS platform enabling educational institutions to:
1. Register and manage their institution on the platform
2. Create, publish, and conduct examinations in two modes (digital + physical paper)
3. Auto-calculate scores on submission
4. Release results with WhatsApp notification to parents
5. Manage the full user lifecycle for all 6 roles

The MVP is a web-only platform (React + Express). No mobile apps. No offline mode beyond what the browser provides.

---

## 2. In-Scope (P0 — Must Ship)

### 2.1 Platform Features

| Feature | Description | Verification |
|---|---|---|
| Multi-tenant architecture | Every institution has isolated data with tenant_id | Cross-tenant query returns no data |
| 6 user roles | Platform Owner, Super Admin, Admin, Teacher, Student, Parent | Each role sees only authorized data |
| JWT authentication | Login, refresh, logout, password reset | Tokens expire and refresh correctly |
| RBAC enforcement | Every endpoint checks role permissions | Unauthorized access returns 403 |
| Subscription management | Plans, payment upload, manual verification, auto-expiry | Expired subscription blocks access |

### 2.2 Institution Management

| Feature | Description |
|---|---|
| Institution CRUD | Super Admin creates/manages institutions |
| Institution status | Enable/disable blocks all access |
| Tenant context | All queries scoped by tenant_id from JWT |

### 2.3 User Management

| Feature | Description |
|---|---|
| User CRUD | Admin creates Teacher, Student accounts |
| Bulk upload | CSV/Excel import for students |
| Parent linking | Parent accounts linked to 1-5 students |
| Profile management | Name, phone, password updates |

### 2.4 Academic Structure

| Feature | Description |
|---|---|
| Academic Years | Create, set current year |
| Classes & Sections | Class → Section hierarchy |
| Subjects | Subject per class with code |
| Enrollment | Student → Class → Section enrollment |

### 2.5 Exam Module

| Feature | Description |
|---|---|
| Exam CRUD | Create with mode selector (DIGITAL/PHYSICAL_PAPER) |
| Question management | Add, edit, bulk upload questions |
| Answer key upload | Server-side only, never to client |
| Exam publish | Draft → Published status transition |
| Exam Mode 1 | Digital questions + OMR on same screen |
| Exam Mode 2 | Physical paper + OMR grid only (NO questions) |
| Auto-save | Answers saved every 30 seconds |
| Server timer | Deadline enforced server-side |
| Manual submit | Student submits before deadline |
| Auto-submit | Job auto-submits at deadline |

### 2.6 Auto Score

| Feature | Description |
|---|---|
| Server-side scoring | Score calculated on every submission |
| Per-question breakdown | Every question evaluated and stored |
| Rank calculation | Dense rank among all exam takers |
| Score recalculation | On answer key correction (before release) |

### 2.7 Results & Notifications

| Feature | Description |
|---|---|
| Result release | One-click release with confirmation |
| Student result view | Score, percentage, rank, per-question breakdown |
| Parent result view | View linked student's results |
| WhatsApp notification | Meta Cloud API, Bull queue |
| Retry + fallback | 3 retries, email fallback, dead-letter queue |
| Notification logging | Every attempt logged |

### 2.8 Frontend Screens

| Screen | Users |
|---|---|
| Login | All |
| Institution Admin Dashboard | Admin |
| Teacher Dashboard | Teacher |
| Exam Creation Form | Teacher |
| Question Editor | Teacher |
| Student Exam (Mode 1) | Student |
| Student Exam (Mode 2) | Student |
| Student/Admin Dashboard | Student |
| Result View | Student, Parent |
| Super Admin Dashboard | Super Admin |
| Platform Owner Dashboard | Platform Owner |

---

## 3. Out-of-Scope (P1+ — Post-MVP)

### 3.1 Features Explicitly Excluded from MVP

| Feature | Rationale | Planned |
|---|---|---|
| Mobile apps (Android/iOS) | Web-first MVP; mobile apps add 2x dev cost | P2 |
| AI question generation | Not required for core exam workflow | P2 |
| Plagiarism detection | Not required for MVP exam integrity | P3 |
| Proctoring / live monitoring | MVP assumes physical invigilation for Mode 2, honor system for Mode 1 | P2 |
| Payment gateway integration | Manual UTR verification is sufficient for MVP; gateway complex | P1 |
| Multi-language support | English + Hindi planned post-MVP | P2 |
| Detailed analytics & reports | Basic result view is sufficient for MVP | P1 |
| Role expansion (Principal, Accountant, Librarian, HR, Examiner) | 6 MVP roles cover the core workflow | P2 |
| White-label / custom branding | Enterprise feature for later | P3 |
| API marketplace / LMS integration | Future ecosystem play | P3 |
| Offline mode (PWA) | Web-only for MVP | P2 |
| WhatsApp reply parsing / interactive messaging | One-direction notification for MVP | P2 |
| Bulk result download (CSV/Excel) | Manual view sufficient for MVP | P1 |
| Scheduled exam start (auto-publish at time) | Teacher manually publishes | P1 |
| Student exam re-attempt | Single attempt per exam for MVP | P2 |

### 3.2 Technical Scope Exclusions

| Item | Rationale |
|---|---|
| Kubernetes / container orchestration | Docker Compose or simple VMs sufficient for MVP |
| Microservices architecture | Modular monolith is correct for MVP |
| Multi-region deployment | Single-region for MVP |
| SOC 2 / ISO 27001 compliance | Too early; plan for Year 2 |
| TypeScript migration | JavaScript ES2022+ for MVP speed |
| End-to-end encrypted data at rest | Not required for exam data sensitivity |
| GraphQL API | REST is sufficient for MVP |

---

## 4. Scope Boundaries & Constraints

### 4.1 Functional Boundaries

| Boundary | In Scope | Out of Scope |
|---|---|---|
| Exam types | MCQ (4 options) | Subjective, essay, fill-in-blanks, match-the-following |
| Question format | Text only | Images, formulas, rich text (future) |
| Student device | Any modern browser | Native apps, tablet-specific OMR (future) |
| Exam duration | 1-480 minutes | Unlimited duration exams |
| Questions per exam | 1-200 | 200+ questions |
| Students per exam | 1-10,000 (plan limit) | Unlimited |
| Notification channel | WhatsApp (primary), Email (fallback) | SMS, push notification, in-app |
| File upload | Payment screenshot only | Question images, student uploads, answer sheet images |
| User import | CSV/Excel | API-based sync, SSO, LDAP |

### 4.2 Technical Boundaries

| Boundary | Constraint |
|---|---|
| Concurrency | 1,000+ sessions per app server |
| Response time (API) | P99 < 500ms |
| Auto-save interval | Every 30 seconds |
| Token expiry | Access: 15 min, Refresh: 7 days |
| File size | Max 5MB |
| API rate limit | 100 req/min per authenticated user |
| Password length | 6-128 characters |

---

## 5. Assumptions

| # | Assumption |
|---|---|
| A-1 | Target institutions have stable internet (at least 2G/3G) during exams |
| A-2 | Students have access to a smartphone, tablet, or laptop with a modern browser |
| A-3 | Teachers have a desktop or laptop for exam creation |
| A-4 | Parents have WhatsApp installed and a registered phone number |
| A-5 | Institutions provide valid parent phone numbers |
| A-6 | Manual payment verification completes within 24 hours |
| A-7 | Meta WhatsApp Cloud API remains available at current pricing |
| A-8 | Browsers support ES2022+ JavaScript features |
| A-9 | Institutions will adopt digital tools given a demonstrable ROI |

---

## 6. Dependencies

| # | Dependency | Risk |
|---|---|---|
| D-1 | Meta WhatsApp Cloud API — active business account, approved template | Medium — setup requires 2-3 days approval |
| D-2 | SendGrid — verified domain, configured sender | Low — straightforward setup |
| D-3 | PostgreSQL 16+ — managed service or self-hosted | Low — commodity |
| D-4 | Redis 7+ — managed service or self-hosted | Low — commodity |
| D-5 | Cloud infrastructure (AWS/GCP/Azure) | Low — credit/account needed |
| D-6 | Node.js 20.x LTS | Low — standard runtime |

---

## 7. Exclusions & Deferrals Summary

| Document Section | Feature | Status |
|---|---|---|
| PRD FR-7.3 | Question bank for re-use across exams | P1 — Deferred |
| PRD FR-8.4 | Answer key correction triggers recalculation | P1 — Deferred |
| PRD FR-11.6 | Leaderboard — top 10 per exam | P1 — Deferred |
| SRS I-3 | Leaderboard | P1 — Deferred |
| All P1 items above | Payment gateway integration | P1 — Deferred |

---

## 8. Scope Change Process

Any request to change the MVP scope must follow this process:

1. **Request:** Stakeholder describes the requested change
2. **Impact analysis:** Product + Engineering assess effort, risk, timeline impact
3. **Trade-off:** Identify what must be removed if new scope is added
4. **Decision:** Founder approves or rejects
5. **Documentation:** Scope document updated with change record

**Scope change criteria:**
- Does it support the core exam workflow?
- Does it serve all 6 roles?
- Does it maintain exam integrity?
- Can it be delivered without delaying the MVP timeline?

---

## 9. Scope Verification Checklist

```markdown
## Scope Verification: [Feature/Item]

### In-Scope Check
- [ ] Feature exists in PRD/SRS as P0?
- [ ] Feature supports core exam workflow?
- [ ] Feature serves MVP roles?
- [ ] Feature does not require P1+ dependency?

### Boundary Check
- [ ] Within functional boundaries (Section 4.1)?
- [ ] Within technical boundaries (Section 4.2)?
- [ ] Assumptions valid (Section 5)?
- [ ] Dependencies met (Section 6)?

### Result
- [ ] ✅ IN SCOPE
- [ ] ❌ OUT OF SCOPE
```

---

## 10. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 11. Approval Sign-Off

**Document:** DOC 1.6 — Scope Document
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Product Lead | opencode | 2026-07-14 | ✅ Approved |
