# DOC 1.2 — Product Requirements Document (PRD)

**Document ID:** 1.2
**Title:** Product Requirements Document — EduOMR MVP
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Product Management
**Date:** 2026-07-14
**Purpose:** Define detailed product requirements for the EduOMR MVP — every feature, user story, acceptance criterion, and non-functional requirement.

---

## 1. Product Overview

EduOMR is a multi-tenant SaaS platform for educational institutions to create, conduct, evaluate, and release results for examinations using two modes:
- **Mode 1 (Digital Paper + Digital OMR):** Full-screen question panel + OMR bubble grid on the same device.
- **Mode 2 (Physical Paper + Digital OMR):** Physical question paper distributed in class; student sees only the OMR grid on screen.

The MVP ships with 6 user roles, subscription management, auto-scoring, WhatsApp result notifications, and full RBAC across all data.

---

## 2. User Personas

### 2.1 Platform Owner

| Attribute | Detail |
|---|---|
| Name | Rajesh Mehta |
| Role | Founder / CEO of EduOMR |
| Goals | Platform growth, revenue, brand reputation |
| Needs | Global analytics, institution oversight, platform-wide settings |
| Pain | No visibility into how institutions use the platform |
| Priority | Core for MVP (limited scope) |

### 2.2 Super Admin

| Attribute | Detail |
|---|---|
| Name | Anita Sharma |
| Role | EduOMR Operations Manager |
| Goals | Manage institutions, verify payments, ensure platform health |
| Needs | Institution CRUD, payment verification, subscription activation |
| Pain | Manual payment verification is tedious |
| Priority | Core for MVP |

### 2.3 Institution Admin

| Attribute | Detail |
|---|---|
| Name | Vikram Singh |
| Role | School Principal / Admin |
| Goals | Manage teachers, students, classes, and subscriptions |
| Needs | User management, subscription status, dashboard, reports |
| Pain | Current exam process is slow, expensive, paper-heavy |
| Priority | Core for MVP |

### 2.4 Teacher

| Attribute | Detail |
|---|---|
| Name | Priya Patel |
| Role | Science Teacher (Grades 9-12) |
| Goals | Create exams, manage questions, release results quickly |
| Needs | Exam builder, question bank, answer key upload, result release |
| Pain | Manually checking 150+ answer sheets takes 3 days |
| Priority | Core for MVP |

### 2.5 Student

| Attribute | Detail |
|---|---|
| Name | Aarav Gupta |
| Role | Class 10 Student |
| Goals | Take exams smoothly, see results instantly |
| Needs | Clean exam interface, auto-save, result view |
| Pain | Exam anxiety; network drops cause lost answers |
| Priority | Core for MVP |

### 2.6 Parent

| Attribute | Detail |
|---|---|
| Name | Sunita Gupta |
| Role | Aarav's Mother |
| Goals | Receive exam results, track child's progress |
| Needs | WhatsApp notifications, result view |
| Pain | School takes 1 week to share printed report cards |
| Priority | Core for MVP |

---

## 3. Functional Requirements

### FR-1: Multi-Tenant Institution Management

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-1.1 | Institution registration with name, address, contact | P0 | |
| FR-1.2 | Institution profile management | P0 | |
| FR-1.3 | Super Admin can view/manage all institutions | P0 | |
| FR-1.4 | Each institution operates in isolated tenant context | P0 | tenant_id on every row |
| FR-1.5 | Institution can be enabled/disabled by Super Admin | P0 | Blocks all access |

### FR-2: User Management

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-2.1 | Institution Admin can invite/create Teacher accounts | P0 | |
| FR-2.2 | Institution Admin can invite/create Student accounts | P0 | |
| FR-2.3 | Parent accounts created and linked to students | P0 | |
| FR-2.4 | Profile management (name, email, phone, password) | P0 | |
| FR-2.5 | Bulk upload for students via CSV/Excel | P0 | |
| FR-2.6 | Role assignment: Admin, Teacher, Student, Parent | P0 | |

### FR-3: Authentication & Authorization

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-3.1 | Login with email + password | P0 | |
| FR-3.2 | JWT access token (15 min expiry) | P0 | |
| FR-3.3 | Refresh token (7 days, httpOnly cookie) | P0 | |
| FR-3.4 | Logout (invalidate refresh token) | P0 | |
| FR-3.5 | Password reset (email-based, 1-hour expiry) | P0 | |
| FR-3.6 | RBAC middleware for all 6 roles | P0 | |
| FR-3.7 | Tenant middleware — tenant_id from JWT | P0 | Never from request body |

### FR-4: Subscription Management

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-4.1 | Subscription plan CRUD (Super Admin) | P0 | |
| FR-4.2 | Plan has: name, price, duration, max_students, features | P0 | |
| FR-4.3 | Institution Admin uploads payment screenshot + UTR | P0 | |
| FR-4.4 | Super Admin verifies payment → activates subscription | P0 | |
| FR-4.5 | Subscription expiry auto-disables access | P0 | |
| FR-4.6 | Subscription guard middleware | P0 | Blocks if expired |

### FR-5: Academic Structure

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-5.1 | Academic Year CRUD | P0 | |
| FR-5.2 | Class CRUD (e.g., Class 10, Class 12) | P0 | |
| FR-5.3 | Section CRUD (e.g., Section A, B) | P0 | |
| FR-5.4 | Subject CRUD | P0 | |
| FR-5.5 | Enroll students in class + section | P0 | |

### FR-6: Exam Module — Core

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-6.1 | Exam CRUD (title, description, date, duration) | P0 | |
| FR-6.2 | Exam mode selection: DIGITAL or PHYSICAL_PAPER | P0 | |
| FR-6.3 | Total marks, marks per correct, negative marking config | P0 | |
| FR-6.4 | Assign exam to class/section | P0 | |
| FR-6.5 | Exam status workflow: Draft → Published → In Progress → Completed → Results Released | P0 | |
| FR-6.6 | Exam publish makes it visible to students | P0 | |

### FR-7: Exam Module — Questions (Mode 1)

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-7.1 | Question CRUD per exam | P0 | |
| FR-7.2 | Question types: MCQs with 4 options | P0 | Expand later |
| FR-7.3 | Question bank for re-use across exams | P1 | |
| FR-7.4 | Bulk question upload via CSV/Excel | P0 | |
| FR-7.5 | Question numbering is sequential within exam | P0 | |

### FR-8: Exam Module — Answer Key

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-8.1 | Answer key upload per exam (post-creation) | P0 | |
| FR-8.2 | Answer key stored server-side only | P0 | Never sent to client |
| FR-8.3 | Answer key supports both exam modes | P0 | |
| FR-8.4 | Answer key correction triggers recalculation | P1 | |

### FR-9: Exam Module — Student Session

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-9.1 | Student can start exam session within published window | P0 | |
| FR-9.2 | Server creates exam_session record on start | P0 | |
| FR-9.3 | Mode 1 endpoint returns questions + OMR grid | P0 | |
| FR-9.4 | Mode 2 endpoint returns OMR grid ONLY (no questions) | P0 | EI-5 enforced |
| FR-9.5 | Student can answer/skip/mark questions | P0 | |
| FR-9.6 | Answers auto-saved every 30 seconds | P0 | |
| FR-9.7 | Server-enforced deadline — answers rejected after T=0 | P0 | EI-3 enforced |
| FR-9.8 | Manual submit available anytime | P0 | |
| FR-9.9 | Auto-submit job runs at exam deadline | P0 | |

### FR-10: Auto Score Calculation

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-10.1 | Score calculated server-side on every submission | P0 | EI-2 enforced |
| FR-10.2 | Algorithm: correct → +marks, wrong → -marks, empty → skipped | P0 | |
| FR-10.3 | Store: total_score, correct_count, wrong_count, skipped_count, percentage | P0 | |
| FR-10.4 | Store per-question breakdown: student_answer, correct_answer, is_correct, marks_awarded | P0 | |
| FR-10.5 | Rank calculated among all students in same exam | P0 | |
| FR-10.6 | Score recalculation on answer key correction | P1 | EI-6 |

### FR-11: Result Release

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-11.1 | Teacher can release result with one click | P0 | |
| FR-11.2 | Results visible to students/parents immediately on release | P0 | |
| FR-11.3 | WhatsApp notification queue triggered on release | P0 | Async |
| FR-11.4 | Notification failure does NOT affect result visibility | P0 | NR-2 |
| FR-11.5 | Result view: score, percentage, rank, per-question breakdown | P0 | |
| FR-11.6 | Leaderboard: top 10 per exam | P1 | |

### FR-12: WhatsApp Notification

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-12.1 | WhatsApp notification queued on result release | P0 | Bull queue |
| FR-12.2 | Template: "Dear {{parent}}, {{student}} scored {{score}}/{{total}} in {{exam}}. Rank: {{rank}}/{{totalStudents}}. — EduOMR" | P0 | |
| FR-12.3 | 3 retries with exponential backoff (2s, 4s, 8s) | P0 | |
| FR-12.4 | Email fallback after 3 WhatsApp failures | P0 | |
| FR-12.5 | Every attempt logged (status, error, timestamp) | P0 | |
| FR-12.6 | Dead-letter queue for permanently failed jobs | P0 | |
| FR-12.7 | Meta WhatsApp Cloud API only | P0 | No unofficial libs |

### FR-13: Frontend — Authentication

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-13.1 | Login page for all roles | P0 | |
| FR-13.2 | Role-based routing after login | P0 | |
| FR-13.3 | Password reset flow | P0 | |
| FR-13.4 | Session management with refresh | P0 | |

### FR-14: Frontend — Teacher Dashboard

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-14.1 | Exam list with status filter | P0 | |
| FR-14.2 | Create exam with mode selector | P0 | |
| FR-14.3 | Question management interface | P0 | |
| FR-14.4 | Answer key upload | P0 | |
| FR-14.5 | Live exam monitor (submission count, timers) | P0 | |
| FR-14.6 | Print question paper PDF (Mode 2) | P0 | |
| FR-14.7 | Release result button | P0 | |

### FR-15: Frontend — Student Exam Interface

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-15.1 | Exam lobby — list of published exams | P0 | |
| FR-15.2 | Mode 1: Question panel (left) + OMR grid (right) on desktop | P0 | |
| FR-15.3 | Mode 1: Stacked layout on mobile | P0 | |
| FR-15.4 | Mode 2: OMR grid only + instruction banner | P0 | |
| FR-15.5 | OMR bubble: 48x48px minimum touch target | P0 | |
| FR-15.6 | Timer display — turns red at <5 min | P0 | |
| FR-15.7 | Auto-save indicator | P0 | |
| FR-15.8 | Question navigator (grid of question numbers) | P0 | |
| FR-15.9 | Manual submit + confirmation dialog | P0 | |

### FR-16: Frontend — Result View

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-16.1 | Score, percentage, rank displayed prominently | P0 | |
| FR-16.2 | Per-question breakdown: correct/wrong/skipped | P0 | |
| FR-16.3 | Mobile-responsive layout | P0 | |
| FR-16.4 | Parent result view (child's results) | P0 | |

---

## 4. Non-Functional Requirements

### NFR-1: Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-1.1 | API P99 response time | <500ms |
| NFR-1.2 | Exam page load time (P99) | <2s |
| NFR-1.3 | Auto-save API response | <200ms |
| NFR-1.4 | Concurrent exam sessions per server | 1,000+ |
| NFR-1.5 | Score calculation time per submission | <1s for 200 questions |

### NFR-2: Security

| ID | Requirement |
|---|---|
| NFR-2.1 | All traffic over HTTPS (TLS 1.3+) |
| NFR-2.2 | Passwords hashed with bcrypt (12 rounds) |
| NFR-2.3 | JWT access tokens expire in 15 minutes |
| NFR-2.4 | Refresh tokens are httpOnly, Secure, SameSite=Strict |
| NFR-2.5 | Answer key never sent to client browser |
| NFR-2.6 | Score never calculated on client |
| NFR-2.7 | All input validated with Zod at controller boundary |
| NFR-2.8 | tenant_id from JWT only — never from request body/params |
| NFR-2.9 | Rate limiting on auth endpoints |

### NFR-3: Reliability

| ID | Requirement |
|---|---|
| NFR-3.1 | Auto-save data persisted within 30 seconds |
| NFR-3.2 | Zero answer loss on network interruption |
| NFR-3.3 | WhatsApp notification delivery within 5 minutes of release |
| NFR-3.4 | Platform uptime: 99.9% during exam hours |
| NFR-3.5 | Database backups: daily automated |

### NFR-4: Scalability

| ID | Requirement |
|---|---|
| NFR-4.1 | Stateless app servers (horizontal scaling ready) |
| NFR-4.2 | Redis for session cache and rate limiting |
| NFR-4.3 | Bull queue for all async jobs |
| NFR-4.4 | Database connection pooling via Prisma |
| NFR-4.5 | Read replicas for reporting queries (post-MVP) |

### NFR-5: Maintainability

| ID | Requirement |
|---|---|
| NFR-5.1 | Layered architecture: Controller → Service → Repository |
| NFR-5.2 | Every module has single responsibility |
| NFR-5.3 | Named exports (no default exports) |
| NFR-5.4 | Functions under 40 lines |
| NFR-5.5 | Test coverage > 80% |
| NFR-5.6 | All errors logged with requestId, userId, tenantId |

### NFR-6: Compatibility

| ID | Requirement |
|---|---|
| NFR-6.1 | Chrome, Firefox, Safari latest 2 versions |
| NFR-6.2 | Mobile: iOS 14+, Android 10+ |
| NFR-6.3 | Minimum screen width supported: 360px |
| NFR-6.4 | No browser plugins required |

---

## 5. MVP Scope Summary

### In Scope (P0 — Must Ship)

- Multi-tenant institution management
- User management for all 6 roles
- JWT auth + RBAC + tenant middleware
- Subscription plans + payment upload + Super Admin verification
- Academic year, class, section, subject CRUD
- Student enrollment
- Exam CRUD with mode selector (DIGITAL / PHYSICAL_PAPER)
- Question CRUD + bulk upload
- Answer key upload (both modes)
- Exam publish workflow
- Mode 1 exam session (questions + OMR on screen)
- Mode 2 exam session (OMR only, no questions)
- Auto-save every 30 seconds
- Server-enforced timer + auto-submit
- Manual submit
- Auto score calculation
- Result release
- WhatsApp notification (Meta Cloud API)
- Student result view + per-question breakdown
- Parent result view
- Teacher dashboard
- Institution Admin dashboard

### Out of Scope (P1 — Post-MVP)

- AI-assisted question generation
- Plagiarism detection
- Advanced analytics and reports
- Proctoring / live monitoring
- Mobile apps (Android/iOS)
- Payment gateway integration (Razorpay/Stripe)
- Multi-language support
- Question paper PDF download (Mode 2)
- Leaderboard
- Role expansion (Principal, Accountant, etc.)
- API rate limiting (admin-configurable)

---

## 6. Integration Requirements

| Integration | Purpose | Provider | Status |
|---|---|---|---|
| Authentication | JWT + Refresh Token | Built-in | P0 |
| Database | PostgreSQL + Prisma ORM | Self-hosted / Cloud | P0 |
| Cache | Redis | Self-hosted / Cloud | P0 |
| Queue | Bull (Redis-backed) | Built-in | P0 |
| WhatsApp | Exam result notifications | Meta WhatsApp Cloud API | P0 |
| Email | Password reset, notification fallback | Nodemailer → SendGrid | P0 |
| PDF | Question paper printing | Puppeteer | P0 |
| Payment | Subscription fee collection | Paytm QR + Manual UTR | P0 |

---

## 7. Data Requirements

- All tenant data includes `tenant_id` column
- All tables have soft delete (`deleted_at`)
- All tables have `created_at` and `updated_at` timestamps
- Primary keys are UUID v4
- Audit log for sensitive operations
- Notification log for all WhatsApp/email attempts

---

## 8. Acceptance Criteria (Key Features)

### AC-1: Institution Registration

```
Given: A new institution wants to register
When: The Super Admin creates the institution record
Then: A tenant_id is generated
And: The institution is in "pending" status
And: Institution Admin login credentials are created
```

### AC-2: Exam Mode 1 — Student Experience

```
Given: A student starts a Mode 1 exam
When: The exam session loads
Then: Questions are shown on the left panel
And: OMR bubbles are shown on the right panel
And: Both panels are visible simultaneously on desktop
And: Timer starts counting down from exam duration
And: Answers auto-save every 30 seconds
```

### AC-3: Exam Mode 2 — Student Experience

```
Given: A student starts a Mode 2 exam
When: The exam session loads
Then: NO question text is visible anywhere on screen
And: Only the OMR grid is displayed
And: An instruction banner says "Answer according to your physical question paper"
And: Timer starts counting down
And: Answers auto-save every 30 seconds
```

### AC-4: Auto Score Calculation

```
Given: A student submits an exam (manual or auto)
When: The server receives the submission
Then: Score is calculated server-side
And: Result is stored with per-question breakdown
And: Student rank is calculated
And: The student can view the result (if released)
And: The client never computed the score
```

### AC-5: WhatsApp Notification

```
Given: A teacher clicks "Release Result"
When: The API receives the request
Then: The API returns 200 immediately
And: A Bull job is queued for each parent
And: Each job sends WhatsApp via Meta Cloud API
And: On success: notification_log updated
And: After 3 retries: email fallback sent
And: On permanent failure: job goes to dead-letter queue
```

### AC-6: Tenant Isolation

```
Given: Two institutions (A and B) are on the platform
When: Institution A admin lists their exams
Then: They only see exams belonging to Institution A
And: No Institution B data is visible
And: API does not accept tenant_id from request body
```

---

## 9. Glossary

| Term | Definition |
|---|---|
| Mode 1 | Digital question paper displayed alongside digital OMR |
| Mode 2 | Physical question paper + digital OMR only (no questions on screen) |
| OMR | Optical Mark Recognition — bubble grid for answer selection |
| Tenant | An institution with isolated data within the platform |
| Auto-score | Server-side calculation of marks on exam submission |
| Answer Key | The correct answers for an exam (server-side only) |
| Result Release | Teacher action to make scores visible + trigger notifications |
| Bull | Redis-backed job queue for async processing |
| UTR | Unique Transaction Reference — bank transfer identifier |
| RBAC | Role-Based Access Control |

---

## 10. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 11. Approval Sign-Off

**Document:** DOC 1.2 — Product Requirements Document
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Product Lead | opencode | 2026-07-14 | ✅ Approved |
