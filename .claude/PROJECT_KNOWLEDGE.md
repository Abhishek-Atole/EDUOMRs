# PROJECT_KNOWLEDGE.md

**Project Name:** EduOMR (Working Title)
**Version:** 2.0.0
**Status:** Planning Phase — Active
**Document Type:** Project Knowledge Base — Single Source of Truth
**Owner:** Project Founder
**Purpose:** This document is the single source of truth for every AI
agent, developer, designer, architect, and future contributor working
on this project. Every decision, every document, and every line of
code must be consistent with what is written here.

---

# 1. Project Vision

EduOMR is an enterprise-grade, subscription-based, AI-assisted
Education Management Platform whose first release focuses on an
advanced OMR Examination System with two distinct exam delivery modes.

The platform is intended to become a commercial SaaS product for:

- Schools
- Colleges
- Coaching Institutes
- Universities
- Training Centers
- Corporate Training
- Certification Providers
- Government Organizations

**This is NOT a college project.**

Every architectural decision must assume this product will eventually
serve thousands to millions of users across all of the above segments.

---

# 2. Mission

Build a modern, scalable, secure, and easy-to-use education platform
with an advanced OMR Examination System as its first module — one that
supports both fully digital exams and traditional physical paper exams
with digital answer capture, automatic score calculation, and instant
parent notification via WhatsApp.

---

# 3. Product Philosophy

- Documentation First
- Architecture First
- Enterprise Quality
- Clean UI
- AI-Assisted Development
- Subscription-Based SaaS
- Multi-Tenant by Design
- Future ERP Expansion
- Exam Integrity by Design
- Zero Shortcuts

---

# 4. Business Model

- Commercial SaaS
- Subscription Based
- Multi-Tenant
- Cloud Ready
- Self-Hosted Ready
- White-Label Ready

---

# 5. Initial Payment Flow

1. Institution selects a subscription plan.
2. Payment is made using the platform Paytm QR code.
3. Screenshot and UTR number are uploaded by the Institution Admin.
4. Status becomes **Pending Verification**.
5. Super Admin verifies the payment manually.
6. Subscription is activated immediately after approval.

Future payment gateway support (architecture must accommodate these
without structural changes):
- Razorpay
- Cashfree
- Stripe
- UPI Deep Links
- International payment gateways

---

# 6. User Roles

## MVP Roles (must be fully implemented in v1.0)

| Role | Scope | Key Responsibility |
|---|---|---|
| Platform Owner | Global | Owns and operates the SaaS platform |
| Super Admin | Global | Manages institutions, verifies payments |
| Institution Admin | Tenant | Manages their institution |
| Teacher | Tenant | Creates and manages exams and results |
| Student | Tenant | Takes exams, views results |
| Parent | Tenant | Receives score notifications |

## Future Roles (architecture must support adding these cleanly)
- Principal
- Accountant
- Librarian
- HR
- Examiner

---

# 7. MVP Hard Requirements

These items are non-negotiable for v1.0. They cannot be deferred,
descoped, or partially implemented. Any architectural decision that
makes these harder to deliver is rejected.

## MVC-1 — Exam Mode 1: Digital Paper + Digital OMR [MVP-CRITICAL]

The fully online exam mode.

- Teacher creates question paper inside the system.
- Questions are stored in the database.
- Student opens exam on their device.
- **Left panel:** Question paper displayed on screen.
- **Right panel:** Digital OMR bubble sheet (A B C D per question).
- Student reads question on screen and clicks corresponding bubble.
- Both panels visible simultaneously on the same screen.
- Auto-save every 30 seconds.
- Server-enforced countdown timer.
- Auto-submit when timer reaches zero.
- Manual submit available before timer ends.
- Student can navigate questions freely.
- Student can mark questions for review.
- Student can clear and re-select any answer.

```
UI Layout — Mode 1:
┌─────────────────────────────────────────────────────────┐
│  Exam Title              ⏱ 01:23:45          [Submit]   │
├──────────────────────────┬──────────────────────────────┤
│  QUESTION PANEL          │  OMR ANSWER SHEET            │
│                          │                              │
│  Q1. What is 2 + 2?      │  1.  ●A  ○B  ○C  ○D        │
│  A. 3   B. 4             │  2.  ○A  ○B  ●C  ○D        │
│  C. 5   D. 6             │  3.  ○A  ○B  ○C  ○D        │
│                          │  4.  ○A  ●B  ○C  ○D        │
│  Q2. Capital of India?   │  5.  ○A  ○B  ○C  ○D        │
│  A. Mumbai  B. Delhi     │                              │
│  C. Chennai D. Kolkata   │  Answered : 23              │
│                          │  Skipped  : 4               │
│  [◀ Prev]   [Next ▶]     │  Marked   : 3               │
└──────────────────────────┴──────────────────────────────┘
```

## MVC-2 — Exam Mode 2: Physical Paper + Digital OMR [MVP-CRITICAL]

The classroom-based exam mode. This mirrors real-world Indian
OMR examination practice.

- Teacher creates exam in the system and sets mode to
  PHYSICAL_PAPER.
- Teacher uploads the answer key (correct option per question).
- Teacher optionally types questions (for records and answer key
  reference only — these are NEVER shown to students during exam).
- Teacher generates and prints the question paper as a PDF
  directly from the system.
- Printed physical papers are distributed to students in the
  classroom before the exam starts.
- Students open the exam on their device (phone, tablet, or PC).
- **Screen shows ONLY the digital OMR bubble grid.**
- **NO questions are displayed on screen at any point.**
- A banner is shown: "Answer according to your physical
  question paper."
- Student reads the physical paper and clicks bubbles on screen.
- Auto-save every 30 seconds.
- Server-enforced countdown timer.
- Auto-submit when timer reaches zero.
- Manual submit available before timer ends.
- Teacher monitors real-time submission progress on dashboard.

```
UI Layout — Mode 2:
┌─────────────────────────────────────────────────────────┐
│  Exam Title              ⏱ 01:23:45          [Submit]   │
│  📄 Answer according to your physical question paper    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   OMR ANSWER SHEET — 50 Questions                      │
│                                                         │
│  Q01  ○A  ●B  ○C  ○D      Q26  ○A  ○B  ●C  ○D        │
│  Q02  ●A  ○B  ○C  ○D      Q27  ○A  ○B  ○C  ●D        │
│  Q03  ○A  ○B  ○C  ○D      Q28  ○A  ●B  ○C  ○D        │
│  Q04  ○A  ○B  ●C  ○D      Q29  ●A  ○B  ○C  ○D        │
│  Q05  ○A  ○B  ○C  ○D      Q30  ○A  ○B  ○C  ○D        │
│  ...                       ...                          │
│                                                         │
│  ████████████░░░░░  Filled: 32 / 50    Skipped: 18     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## MVC-3 — Auto Score Calculation [MVP-CRITICAL]

Triggered automatically on every exam submission (manual or
auto-submit). Score is never calculated on the client.
Score calculation always runs server-side only.

**Algorithm:**

```
Initialize: score = 0, correct = 0, wrong = 0, skipped = 0

FOR each question_number FROM 1 TO total_questions:

  student_answer  = student's selected bubble for this question
  correct_answer  = answer key value for this question

  IF student_answer is empty or null:
    skipped += 1
    (no marks change)

  ELSE IF student_answer == correct_answer:
    score   += marks_per_correct
    correct += 1

  ELSE:
    wrong += 1
    IF negative_marking_enabled:
      score -= negative_marks_per_wrong
      IF score < 0 AND clamp_to_zero is true:
        score = 0

percentage = ROUND((score / total_possible_marks) × 100, 2)
```

**What is stored per submission:**
- total_score
- total_possible_marks
- correct_count
- wrong_count
- skipped_count
- percentage
- rank (calculated when result is released)
- Per-question breakdown: question_number, student_answer,
  correct_answer, is_correct, marks_awarded

**Exam configuration options (both modes):**
- Total questions: 10 to 200
- Options per question: 4 (A B C D) or 5 (A B C D E)
- Marks per correct answer: configurable
- Negative marking: optional, configurable per exam
- Duration: configurable in minutes
- Clamp score at zero: configurable

## MVC-4 — Parent WhatsApp Score Notification [MVP-CRITICAL]

WhatsApp notification is NOT a future feature.
It ships in v1.0. It is a core product promise.

**Trigger:** Teacher clicks "Release Result" for an exam.

**Flow:**
1. Teacher clicks Release Result.
2. API immediately sets result_status = RELEASED.
3. API queues one background notification job per student
   who has a linked parent with a verified phone number.
4. HTTP response returns immediately — the queue is non-blocking.
5. Background worker processes each job:
   a. Fetches student → parent → parent phone number.
   b. Validates phone number is present and verified.
   c. Calls Meta WhatsApp Cloud API with approved template.
   d. On success: logs status = SENT to notification_logs.
   e. On failure: retries up to 3 times with exponential
      backoff (2s, 4s, 8s).
   f. After 3 failures: logs status = FAILED, attempts
      email fallback, alerts Platform Owner if failure
      rate exceeds 10%.

**WhatsApp provider:** Meta WhatsApp Cloud API (official).
Free tier: 1,000 conversations per month.
Cost beyond free tier: ~₹0.40 per conversation.
Unofficial libraries (whatsapp-web.js, Baileys) are
permanently prohibited — ToS violation, account ban risk.

**Message template:**
```
Name    : exam_result_notification
Body    : "Dear {{1}}, your child {{2}} scored {{3}} out of
           {{4}} in {{5}}. Rank: {{6}} out of {{7}} students.
           — EduOMR"

{{1}} Parent name
{{2}} Student name
{{3}} Score achieved
{{4}} Total marks
{{5}} Exam title
{{6}} Student rank
{{7}} Total students appeared
```

**Critical integrity rule:**
Exam result is ALWAYS stored correctly regardless of whether
WhatsApp notification succeeds or fails. These two operations
are completely decoupled. Notification failure never corrupts
or delays result storage.

## MVC-5 — Multi-Tenant Institution Management [MVP-CRITICAL]

One platform. Unlimited institutions. Complete data isolation.
Every database query on tenant-scoped data mandatorily includes
tenant_id. No exceptions.

## MVC-6 — Subscription Management [MVP-CRITICAL]

Manual payment verification flow as specified in Section 5.
Subscription guard blocks access to exam features when
subscription is expired or inactive.

## MVC-7 — Role-Based Access Control [MVP-CRITICAL]

All 6 MVP roles fully implemented with permission matrix.
Every API endpoint specifies which roles can access it.

## MVC-8 — Student Result Review [MVP-CRITICAL]

After result release, student can view:
- Total score and percentage
- Rank among all students who appeared
- Per-question breakdown:
  - Their selected answer
  - The correct answer
  - Whether they got it right or wrong
  - Marks awarded or deducted per question

---

# 8. Core Modules

## Core

- Authentication
- Authorization (RBAC)
- Institution Management
- Subscription Management
- Notification Engine [upgraded to MVP-CRITICAL]
- Settings

## Education

- Academic Years
- Classes
- Sections
- Subjects
- Teachers
- Students
- Parents
- Attendance [Phase 2]
- Timetable [Phase 2]
- Assignments [Phase 2]

## Examination

- **Exam Mode 1 — Digital Paper + Digital OMR** [MVP-CRITICAL]
- **Exam Mode 2 — Physical Paper + Digital OMR** [MVP-CRITICAL]
- **Auto Score Calculation Engine** [MVP-CRITICAL]
- Question Bank (Mode 1 and optional records for Mode 2)
- Question Paper Generator and PDF Printer (Mode 2)
- Answer Key Management (both modes)
- Exam Scheduling
- Exam Session Management
- Timer (server-enforced)
- Auto Save (every 30 seconds)
- Auto Submit (on timer expiry)
- Result Storage and Release
- Student Result Review with Answer Breakdown
- Analytics and Reports
- Leaderboard (Top 10 per exam)

## Communication

- **WhatsApp Score Notification via Meta Cloud API** [MVP-CRITICAL]
- Email Notifications [MVP]
- Announcements [Phase 2]

## AI (Future)

- AI Question Generator
- AI Tutor
- AI Performance Analysis
- AI Study Planner

---

# 9. Technology Stack (Locked)

Locked after TRD approval. Listed here for reference.

| Layer | Technology |
|---|---|
| Runtime | Node.js LTS |
| Language | JavaScript ES2022+ strict mode |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Cache | Redis |
| Queue | Bull (backed by Redis) |
| Auth | JWT + Refresh Tokens |
| Password Hashing | bcrypt (12 rounds) |
| Input Validation | Zod |
| Logging | Winston |
| Testing | Jest + Supertest |
| PDF Generation | Puppeteer |
| WhatsApp | Meta WhatsApp Cloud API |
| Email | Nodemailer (MVP) → SendGrid (production) |
| Frontend | React 18 + Vite |
| UI Library | Tailwind CSS + shadcn/ui |
| State Management | Zustand |
| HTTP Client | Axios |
| Dev OS | Ubuntu |
| Version Control | Git |

---

# 10. UI/UX Principles

- Professional
- Minimal
- Enterprise (not flashy, not childish)
- Responsive — Desktop, Tablet, Mobile
- Accessible
- Mobile First
- Dark Mode and Light Mode
- Enterprise Look and Feel

Inspired by: Notion, Linear, GitHub, Jira, Microsoft 365,
Google Workspace.

**Exam UI specific rules:**
- Mode 1 exam screen must show both panels simultaneously
  on desktop and stack vertically on mobile.
- Mode 2 exam screen must show ONLY the OMR grid —
  no questions, no hints, no content that could substitute
  for the physical paper.
- OMR bubble selection must be large enough to tap accurately
  on a mobile screen.
- Timer must always be visible and turn red in the last 5 minutes.
- Auto-save indicator must be visible and non-intrusive.

---

# 11. Architecture Principles

- Clean Architecture
- Modular Monolith (MVP) — Microservice-ready
- API First
- Domain-Oriented Modules
- Horizontal Scaling Ready
- 12-Factor App Compliance
- No business logic in controllers
- No database queries in services
- No cross-module direct database access
- Multi-tenancy enforced at the repository layer

---

# 12. Security Principles

- OWASP Top 10 compliance mandatory
- RBAC enforced on every endpoint
- JWT Authentication + Refresh Tokens
- bcrypt password hashing
- Audit Logging for all sensitive actions
- Input Validation with Zod on all endpoints
- Rate Limiting on all public endpoints
- Parameterized queries only — no string concatenation
- Answer key NEVER sent to client browser
- Score NEVER calculated on client
- Exam timer enforced server-side — client timer is display only
- tenant_id always from JWT — never from user-supplied input
- Sensitive data (passwords, tokens, answer keys) never in logs

---

# 13. Development Rules

- No coding before documentation is complete and approved.
- Every feature follows:
  Requirement → Analysis → Architecture → Design →
  Review → Improve → Validate → Approve → Implement
- Every AI-generated artifact must be reviewed before approval.
- No architectural shortcuts.
- No phase skipping.
- One document approved before the next begins.
- Git commit after every approved document.

---

# 14. Exam Integrity Rules

These rules protect the fairness and security of every exam
conducted on the platform. They are as important as security rules.

- EI-1: Answer key is stored server-side only. It is never
        transmitted to any client device at any time.
- EI-2: Score calculation runs only on the server.
        The client has no access to scoring logic or answer keys.
- EI-3: Exam timer deadline is enforced server-side.
        The server rejects any answer submission received after
        the deadline. Client timer is for display only.
- EI-4: A student can only access their own exam session.
        Accessing another student's session returns 403.
- EI-5: For Mode 2, questions are never transmitted to the
        student's device. The screen shows only the OMR grid.
- EI-6: Auto-save stores answers encrypted in transit (HTTPS).
- EI-7: Score recalculation must be possible if an answer key
        is corrected after initial evaluation.

---

# 15. Notification Rules

- NR-1: WhatsApp notification always runs as a background job.
        It never blocks the HTTP response cycle.
- NR-2: Exam result storage and notification are fully decoupled.
        Notification failure never affects result storage.
- NR-3: Every notification attempt is logged in notification_logs
        with status, attempts, error details, and timestamp.
- NR-4: Maximum 3 retry attempts per notification with
        exponential backoff.
- NR-5: After 3 failures, email fallback is attempted.
- NR-6: Platform Owner is alerted if failure rate exceeds 10%
        for any single result release batch.
- NR-7: Unofficial WhatsApp libraries are permanently prohibited.

---

# 16. Current Status

**Version:** 2.0.0
**Phase:** Planning and Documentation

**Completed:**
- PROJECT_KNOWLEDGE.md v1.0.0 (now superseded by v2.0.0)
- AI Master System Prompt (Doc 0.1) — Approved
- AI Documentation Generator (Doc 0.2) — Approved
- AI Code Generator (Doc 0.3) — Approved
- AI Reviewer (Doc 0.4) — Approved
- Master Project Prompt v2.0.0 — Approved
- Master Development Prompt v2.0.0 — Approved
- WhatsApp API sample (working Node.js implementation) — Complete

**Next Deliverables (in order):**
1. Doc 0.5 — AI Security Reviewer
2. Doc 0.6 — AI Performance Reviewer
3. Doc 0.7 — AI Testing Prompt
4. Doc 0.8 — AI Refactoring Prompt
5. Doc 0.9 — AI Architecture Reviewer
6. Doc 0.10 — AI UI/UX Reviewer
7. Doc 0.11 — AI Loop Framework
8. Doc 0.12 — Coding Standards
9. Doc 0.13 — Architecture Rules
10. Doc 0.14 — UI/UX Guidelines
11. Doc 0.15 — Definition of Done
12. Doc 0.16 — Project Memory
13. Phase 1 begins after all Phase 0 docs approved

**Open Decisions:**
- Deployment target (cloud provider) — decided in Doc 2.6
- Self-hosted vs cloud-first MVP — decided in Doc 1.9
- Free trial duration — decided in Doc 1.5

---

# 17. Terminology Lock

Once defined here, these terms must be used consistently
across every document, every codebase, every UI label.
No synonyms. No variations.

| Approved Term | Never Use |
|---|---|
| Institution | School, Org, Client, Tenant (user-facing) |
| Institution Admin | School Admin, Org Admin, Admin User |
| Platform Owner | Super User, Root Admin, Owner |
| Exam Mode 1 | Online Mode, Digital Mode, Full Digital |
| Exam Mode 2 | Offline Mode, Classroom Mode, Hybrid Mode |
| Physical Paper | Question Sheet, Print Sheet, Paper Copy |
| Digital OMR Sheet | Answer Grid, Bubble Sheet, OMR Form |
| Auto Score | Auto Grading, Auto Marking, Auto Evaluation |
| Answer Key | Solution Key, Correct Answers, Key Sheet |
| Result Release | Publish Results, Show Results, Declare Results |
| Subscription Plan | Plan, Package, License, Tier |
| Academic Year | Session, Batch Year, School Year |
| WhatsApp Notification | WhatsApp Alert, WA Message, WA Notification |

---

# Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-05 | Superseded | Initial project knowledge base |
| 2.0.0 | 2026-07-13 | Active | Added Exam Mode 1, Exam Mode 2, Auto Score Calculation, WhatsApp as MVP-Critical, Technology Stack, Exam Integrity Rules, Notification Rules, Terminology Lock |
