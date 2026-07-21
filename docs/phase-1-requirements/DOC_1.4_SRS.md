# DOC 1.4 — Software Requirements Specification (SRS)

**Document ID:** 1.4
**Title:** Software Requirements Specification — EduOMR MVP Functional & System Specifications
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Product + Engineering
**Date:** 2026-07-14
**Purpose:** Define the complete software requirements for EduOMR — every functional requirement with detailed behavior, data requirements, interface specifications, and validation criteria.

---

## 1. System Overview

EduOMR is a multi-tenant SaaS platform for educational institutions to digitize the full examination lifecycle. The system serves 6 user roles across 8 core modules. Two exam modes are supported: fully digital (Mode 1) and physical paper + digital OMR (Mode 2).

This SRS is derived from DOC 1.2 (PRD) and contains the complete, detailed specification for every feature in the MVP.

---

## 2. Functional Requirements — Detailed Specifications

### MODULE A: Authentication & Authorization

#### A.1 Login
**ID:** SRS-A-001
**Description:** User logs in using registered email and password.
**Trigger:** User navigates to login page.
**Preconditions:** User account exists and is active.
**Postconditions:** Access token + refresh token issued.

**Flow:**
1. User enters email + password
2. System validates email format (Zod schema)
3. System finds user by email (case-insensitive)
4. System compares password hash (bcrypt)
5. If invalid: return 401 "Invalid email or password"
6. If valid: generate access token (JWT, 15 min) with payload: `{ userId, tenantId, role, email }`
7. Generate refresh token (JWT, 7 days), set as httpOnly cookie
8. Return 200 with `{ accessToken, user: { id, name, email, role } }`

**Validation:**
- Email: valid email format, max 255 chars
- Password: min 6 chars, max 128 chars
- Rate limit: 5 attempts per minute per IP

#### A.2 Token Refresh
**ID:** SRS-A-002
**Description:** Refresh expired access token using refresh token.
**Trigger:** Client receives 401 and calls refresh endpoint.
**Preconditions:** Refresh token cookie exists and is valid.
**Postconditions:** New access token + rotated refresh token issued.

#### A.3 Logout
**ID:** SRS-A-003
**Description:** Invalidate refresh token.
**Trigger:** User clicks logout.
**Preconditions:** User is authenticated.
**Postconditions:** Refresh token cleared from cookie, refresh token record invalidated.

#### A.4 Password Reset
**ID:** SRS-A-004
**Description:** User resets forgotten password via email.
**Flow:**
1. User enters registered email
2. System generates reset token (crypto.randomBytes(32)), expires in 1 hour
3. System sends email with reset link (Nodemailer → SendGrid)
4. User clicks link, enters new password
5. System validates token, updates password hash
6. System invalidates all existing refresh tokens for that user

#### A.5 RBAC Enforcement
**ID:** SRS-A-005
**Description:** Every API endpoint checks user role before allowing access.
**Implementation:** RBAC middleware that checks `req.user.role` against endpoint's allowed roles list.
**Denied response:** 403 Forbidden with code `FORBIDDEN`.

---

### MODULE B: Institution Management

#### B.1 Institution Registration
**ID:** SRS-B-001
**Description:** Super Admin creates a new institution.
**Data:** name, address, contact_email, contact_phone, admin_name, admin_email, admin_phone
**Flow:**
1. Super Admin fills institution creation form
2. System validates all fields
3. System creates institution record (status: pending)
4. System creates Institution Admin user account (default password: auto-generated, emailed)
5. System returns institution details

#### B.2 Institution Status Management
**ID:** SRS-B-002
**Description:** Super Admin enables or disables an institution.
**Effect:** Disabled institution blocks all logins and API access for all users under that tenant.

#### B.3 Tenant Context Middleware
**ID:** SRS-B-003
**Description:** Every authenticated request has `tenant_id` extracted from JWT and attached to `req.tenantId`.
**Enforcement:** All repository methods for tenant-scoped data filter by `req.tenantId`.

---

### MODULE C: Subscription Management

#### C.1 Plan Management (Super Admin)
**ID:** SRS-C-001
**Description:** Super Admin creates, updates, and lists subscription plans.
**Data:** name, price, duration_days, max_students, features (JSON), is_active

#### C.2 Payment Upload (Institution Admin)
**ID:** SRS-C-002
**Description:** Institution Admin uploads payment screenshot and enters UTR number.
**Data:** plan_id, utr_number, amount, screenshot_url (file upload), notes
**Flow:**
1. Admin selects plan
2. Uploads payment screenshot (PNG/JPG, max 5MB)
3. Enters UTR number and amount
4. System creates payment_upload record (status: pending)

#### C.3 Payment Verification (Super Admin)
**ID:** SRS-C-003
**Description:** Super Admin views pending payments, verifies against screenshot, activates subscription.
**Flow:**
1. Super Admin views pending payments list
2. Opens payment details with screenshot
3. Clicks Verify → subscription activated for plan duration
4. Or clicks Reject → status set to rejected with reason

#### C.4 Subscription Guard
**ID:** SRS-C-004
**Description:** Middleware that checks if institution has active subscription.
**Enforcement:**
- Check subscription status on every API call (cached for 30 min)
- If no active subscription: return 402 Payment Required with code `SUBSCRIPTION_EXPIRED`
- Exempt endpoints: login, subscription payment upload

#### C.5 Auto-Expiry
**ID:** SRS-C-005
**Description:** Cron job runs daily to expire subscriptions whose end_date has passed.
**Effect:** Institution status set to disabled, subscription guard blocks access.

---

### MODULE D: User Management

#### D.1 User Creation (Admin)
**ID:** SRS-D-001
**Description:** Institution Admin creates Teacher or Student accounts.
**Data:** email, first_name, last_name, phone, role (teacher | student)
**Flow:**
1. Admin fills user creation form
2. System validates email uniqueness within tenant
3. System creates user with auto-generated password
4. System returns user details (password shown once or emailed)

#### D.2 Bulk User Upload
**ID:** SRS-D-002
**Description:** Admin uploads CSV/Excel file with multiple users.
**Format:** email, first_name, last_name, phone, role
**Validation:** All rows validated; partial failures reported with row numbers.

#### D.3 Parent-Student Linking
**ID:** SRS-D-003
**Description:** Parent accounts are created and linked to one or more students.
**Flow:**
1. Admin creates or selects existing parent
2. Selects student(s) to link
3. System creates parent_student linkage records
4. Parent can view results of linked students only

#### D.4 Profile Management
**ID:** SRS-D-004
**Description:** Users can update their own profile (name, phone, password).
**Constraint:** Email cannot be changed after creation (requires Super Admin).

---

### MODULE E: Academic Structure

#### E.1 Academic Year Management
**ID:** SRS-E-001
**CRUD:** Create, list, update, delete academic years.
**Data:** name (e.g., "2026-27"), start_date, end_date, is_current
**Constraint:** Only one academic year can be current at a time.

#### E.2 Class & Section Management
**ID:** SRS-E-002
**CRUD:** Classes (e.g., "Class 10") and Sections (e.g., "Section A", "Section B").
**Relationship:** Class has many sections.

#### E.3 Subject Management
**ID:** SRS-E-003
**CRUD:** Subjects within a class.
**Data:** name, code (e.g., "SCI-101"), class_id

#### E.4 Student Enrollment
**ID:** SRS-E-004
**Description:** Admin enrolls student in a class + section for an academic year.
**Flow:**
1. Select student
2. Select academic year, class, section
3. System creates enrollment record
4. Student appears in exam assignment list for that class

---

### MODULE F: Exam Module

#### F.1 Exam Creation
**ID:** SRS-F-001
**Description:** Teacher creates a new exam.
**Data:**
- title, description
- exam_mode: DIGITAL | PHYSICAL_PAPER
- total_marks, marks_per_correct, marks_per_wrong
- negative_marking: boolean
- duration_minutes
- scheduled_at (start time), deadline_at (end time)
- class_id, subject_id

**Validation:**
- duration_minutes: 1-480
- total_marks: 1-1000
- Marks per correct + wrong: must be positive

#### F.2 Question Management
**ID:** SRS-F-002
**Description:** Teacher adds questions to an exam.
**Data:** question_text, options (JSON: {A, B, C, D}), correct_option, marks, order_index
**Flow:**
1. Teacher adds questions one-by-one or via bulk upload (CSV/Excel)
2. Questions are numbered sequentially (order_index)
3. Teacher can reorder, edit, or delete questions before publishing

**Bulk Upload Format:**
```
question_text,option_a,option_b,option_c,option_d,correct_option,marks
"What is 2+2?",3,4,5,6,B,1
```

#### F.3 Answer Key Upload
**ID:** SRS-F-003
**Description:** Teacher uploads answer key for the exam.
**Data:** question_number → correct_option mapping
**Constraint:** Answer key stored server-side only. NEVER sent to client browser.

#### F.4 Exam Publish
**ID:** SRS-F-004
**Description:** Teacher publishes the exam, making it visible to assigned students.
**Effect:**
- Status changes from draft → published
- Exam appears in student exam lobby
- Students can start session only between scheduled_at and deadline_at
- No further edits to questions or answer key allowed (except Super Admin override)

#### F.5 Exam Session — Start
**ID:** SRS-F-005
**Description:** Student starts an exam session.
**Preconditions:**
- Exam status = published
- Current time between scheduled_at and deadline_at
- Student is enrolled in the assigned class
- No existing session for this student + exam

**Flow:**
1. Student clicks "Start Exam"
2. System creates exam_session record (status: in_progress)
3. System calculates deadline = NOW + duration_minutes (or uses deadline_at if sooner)
4. System returns session_id + session data

#### F.6 Exam Session — Mode 1 (Digital Paper + Digital OMR)
**ID:** SRS-F-006
**Description:** Student views questions and OMR grid simultaneously.
**Endpoint returns:**
- Questions: array of { question_number, question_text, options: { A, B, C, D } }
- OMR grid state: array of { question_number, selected_option or null }
- Timer: remaining_seconds
- Session status

**Constraint:** Questions are returned for Mode 1 only.

#### F.7 Exam Session — Mode 2 (Physical Paper + Digital OMR)
**ID:** SRS-F-007
**Description:** Student views OMR grid ONLY. No question content.
**Endpoint returns:**
- OMR grid state: array of { question_number, selected_option or null }
- Timer: remaining_seconds
- Session status
- Instruction banner text

**Strict constraint:** NO question text, NO options, NO hints. Only OMR bubble grid.

#### F.8 Auto-Save Answers
**ID:** SRS-F-008
**Description:** Student answers are automatically saved every 30 seconds.
**Trigger:** Client calls `/exam-sessions/:id/save` every 30 seconds with all answers.
**Flow:**
1. Client sends array of { question_index, selected_option }
2. System upserts student_answers for each question
3. System returns success
4. On network recovery after interruption, client syncs pending answers

**Validation:**
- selected_option must be A, B, C, D, or null (for skip/unmark)
- Only answers for questions within exam range accepted

#### F.9 Server Timer Enforcement
**ID:** SRS-F-009
**Description:** Server enforces exam deadline. No answers accepted after T=0.
**Implementation:**
- On every save/submit call, server checks: `NOW() <= exam_session_started_at + duration_minutes`
- If expired: return 422 with code `EXAM_TIME_EXPIRED`
- Auto-submit job runs at deadline for all in-progress sessions

#### F.10 Manual Submit
**ID:** SRS-F-010
**Description:** Student manually submits exam before deadline.
**Flow:**
1. Student clicks "Submit" button
2. Confirmation dialog: "Are you sure? You have X minutes remaining."
3. On confirm: session status → submitted
4. Trigger score calculation

**Validation:**
- Session must be in_progress
- Current time must be before deadline

#### F.11 Auto-Submit (Deadline Job)
**ID:** SRS-F-011
**Description:** Cron/Bull job that auto-submits all in-progress sessions at exam deadline.
**Trigger:** Scheduled Bull job at exam deadline time.
**Flow:**
1. Job queries all exam_sessions where status = in_progress AND exam_id = X
2. For each session: set status = auto_submitted
3. Trigger score calculation for each

---

### MODULE G: Auto Score Calculation

#### G.1 Score Calculation Engine
**ID:** SRS-G-001
**Description:** Server calculates score immediately on exam submission.
**Trigger:** Manual submit, auto-submit, or manual recalculation.
**Algorithm:**
```
FOR each question in exam:
  IF student_answer is NULL → skipped_count += 1
  ELSE IF student_answer == correct_answer → 
    score += marks_per_correct
    correct_count += 1
  ELSE →
    wrong_count += 1
    IF negative_marking: score -= marks_per_wrong

percentage = ROUND((MAX(score, 0) / total_marks) * 100, 2)
```
**Storage:** Creates result record with total_score, correct_count, wrong_count, skipped_count, percentage.

#### G.2 Per-Question Breakdown
**ID:** SRS-G-002
**Description:** Store every question's evaluation result for student review.
**Data:** question_id, student_answer, correct_answer, is_correct, marks_awarded

#### G.3 Rank Calculation
**ID:** SRS-G-003
**Description:** Calculate student's rank among all students who took the same exam.
**Algorithm:**
1. Query all results for exam_id, ordered by percentage DESC
2. Assign rank (dense rank — same score = same rank)
3. Update rank + total_students on result record
**Trigger:** On every new result, recalculate all ranks (or batch at result release).

#### G.4 Score Recalculation
**ID:** SRS-G-004
**Description:** Recalculate all scores when answer key is corrected (before result release).
**Trigger:** Teacher updates answer key.
**Effect:** All existing results for the exam are recalculated. New ranks assigned.

---

### MODULE H: Result Release & Notification

#### H.1 Result Release
**ID:** SRS-H-001
**Description:** Teacher releases results for an exam.
**Flow:**
1. Teacher clicks "Release Result" on exam detail page
2. Confirmation: "This will make results visible to all students and send WhatsApp notifications."
3. On confirm:
   a. Update exam status → results_released
   b. Update all results: is_released = true, released_at = NOW()
   c. Queue WhatsApp notification jobs for each parent with linked student
4. Return 200 immediately

#### H.2 WhatsApp Notification — Queue
**ID:** SRS-H-002
**Description:** Bull job sends WhatsApp message to each parent via Meta Cloud API.
**Job data:** parent_id, student_name, score, total_marks, exam_title, rank, total_students
**Template:** "Dear {{parentName}}, your child {{studentName}} scored {{score}} out of {{totalMarks}} in {{examTitle}}. Rank: {{rank}} out of {{totalStudents}}. — EduOMR"

#### H.3 WhatsApp Notification — Retry & Fallback
**ID:** SRS-H-003
**Retry:** 3 attempts with exponential backoff (2s, 4s, 8s).
**Fallback:** After 3 failures, send email via SendGrid.
**Dead-letter:** After email failure, job moves to dead-letter queue.

#### H.4 Notification Logging
**ID:** SRS-H-004
**Description:** Every notification attempt is logged.
**Data:** channel (whatsapp|email), status (queued|sent|failed|dead_letter), attempt_number, error_message, timestamps

---

### MODULE I: Result Viewing

#### I.1 Student Result View
**ID:** SRS-I-001
**Description:** Student views their result after release.
**Data shown:** total_score, total_marks, percentage, rank, total_students, correct_count, wrong_count, skipped_count
**Per-question breakdown:** question_number, student_answer, correct_answer, is_correct, marks_awarded
**Constraint:** Only visible if `is_released = true`.

#### I.2 Parent Result View
**ID:** SRS-I-002
**Description:** Parent views linked student's results.
**Constraint:** Parent can only see results for students they are linked to.
**Data:** Same as student result view.

#### I.3 Leaderboard (P1 — Post-MVP)
**ID:** SRS-I-003
**Description:** Top 10 students ranked by percentage for an exam.
**Constraint:** Only visible after result release.

---

## 3. System Interfaces

### 3.1 REST API Interface

As defined in DOC 1.3 (TRD) Section 3.

### 3.2 External System Interfaces

| External System | Interface Type | Protocol | Purpose |
|---|---|---|---|
| Meta WhatsApp Cloud API | REST API | HTTPS | Send result notifications |
| SendGrid | REST API | HTTPS | Email notifications (fallback) |
| Puppeteer (Headless Chrome) | Subprocess | stdio | PDF generation |
| PostgreSQL | Database | TCP (TLS) | Primary data store |
| Redis | In-memory DB | TCP | Cache + message queue |

### 3.3 User Interfaces

| Interface | Technology | Device | Users |
|---|---|---|---|
| Login Page | React | All | All |
| Institution Admin Dashboard | React | Desktop preferred | Admin |
| Teacher Dashboard | React | Desktop preferred | Teacher |
| Exam Creation Form | React | Desktop | Teacher |
| Question Editor | React | Desktop | Teacher |
| Student Exam (Mode 1) | React | All | Student |
| Student Exam (Mode 2) | React | All | Student |
| Result View | React | All | Student, Parent |
| Super Admin Dashboard | React | Desktop | Super Admin |
| Platform Owner Dashboard | React | Desktop | Platform Owner |

### 3.4 UI Content Constraints

| Constraint | Mode 1 | Mode 2 |
|---|---|---|
| Question text shown | Yes | No |
| Options shown | Yes | No |
| OMR bubble grid | Yes | Yes |
| Timer | Yes | Yes |
| Instruction banner | No | Yes: "Answer according to your physical question paper" |

---

## 4. Data Requirements & Validation

### 4.1 Field Validation Rules (Zod Schemas)

| Field | Type | Validation |
|---|---|---|
| email | string | Email format, max 255 chars, unique per tenant |
| password | string | Min 6, max 128 chars |
| phone | string | Indian mobile: 10 digits, optional +91 prefix |
| name | string | Min 1, max 100 chars |
| total_marks | number | 1-1000 |
| duration_minutes | number | 1-480 |
| marks_per_correct | number | 0.1-100 |
| selected_option | string | null or A/B/C/D |
| utr_number | string | 12-22 chars alphanumeric |
| file_upload | file | PNG/JPG/PDF, max 5MB |

### 4.2 Data Retention

| Data | Retention | Notes |
|---|---|---|
| User accounts | Indefinite | Soft-deleted users retain data for audit |
| Exam data | Indefinite | Historical exam data always available |
| Student answers | Indefinite | Required for per-question breakdown |
| Notification logs | 1 year | After 1 year, summary retained, details purged |
| Payment records | 7 years | Tax/audit compliance |
| Session tokens | Until expiry | Max 7 days (refresh token) |

---

## 5. Non-Functional Requirements (Detailed)

### 5.1 Performance

| ID | Requirement | Specification |
|---|---|---|
| SRS-NF-001 | Concurrent users | 1,000+ simultaneous exam sessions per app server |
| SRS-NF-002 | API latency (P99) | <500ms for 95% of endpoints |
| SRS-NF-003 | Auto-save latency (P99) | <200ms |
| SRS-NF-004 | Score calculation | <1 second for 200 questions |
| SRS-NF-005 | Page load (P99) | <2 seconds |
| SRS-NF-006 | File upload size | Max 5MB per file |

### 5.2 Reliability

| ID | Requirement | Specification |
|---|---|---|
| SRS-NF-007 | Auto-save reliability | Zero data loss on network interruption |
| SRS-NF-008 | WhatsApp delivery SLA | >95% within 5 minutes of release |
| SRS-NF-009 | Platform uptime | 99.9% during scheduled exam hours |
| SRS-NF-010 | DB backup | Daily automated, 7-day retention |
| SRS-NF-011 | Session data durability | Answers persisted on every save call |

### 5.3 Security

| ID | Requirement | Specification |
|---|---|---|
| SRS-NF-012 | Transport security | HTTPS only, TLS 1.3+ |
| SRS-NF-013 | Password hashing | bcrypt, 12 rounds |
| SRS-NF-014 | Token expiry | Access: 15 min, Refresh: 7 days |
| SRS-NF-015 | Answer key exposure | NEVER sent to client |
| SRS-NF-016 | Score computation | Server-side only |
| SRS-NF-017 | Input validation | Zod schema on every endpoint |
| SRS-NF-018 | Tenant isolation | tenant_id from JWT only |

### 5.4 Maintainability

| ID | Requirement | Specification |
|---|---|---|
| SRS-NF-019 | Code coverage | >80% (unit + integration) |
| SRS-NF-020 | Function size | Max 40 lines |
| SRS-NF-021 | Module structure | Controller → Service → Repository |
| SRS-NF-022 | Logging | Winston, structured JSON, requestId included |

### 5.5 Compatibility

| ID | Requirement | Specification |
|---|---|---|
| SRS-NF-023 | Browsers | Chrome, Firefox, Safari (latest 2 versions) |
| SRS-NF-024 | Mobile OS | iOS 14+, Android 10+ |
| SRS-NF-025 | Minimum screen | 360px width |
| SRS-NF-026 | No plugins | No Flash, no NPAPI, no ActiveX |

---

## 6. Business Rules

| ID | Rule |
|---|---|
| BR-1 | An institution can have multiple subscription plans over time (sequential, not overlapping) |
| BR-2 | A student can only have one active exam session per exam |
| BR-3 | A teacher can only see exams they created (or all exams within their department if Admin grants) |
| BR-4 | Results cannot be released until the exam deadline has passed |
| BR-5 | Answer key cannot be modified after result release |
| BR-6 | Parent can only access results of their linked students (max 5 students per parent) |
| BR-7 | Student cannot access exam after submission (read-only result view after release) |
| BR-8 | A deleted institution blocks all logins within 5 minutes |

---

## 7. Assumptions & Dependencies

### 7.1 Assumptions

- Target institutions have at least 2G/3G mobile internet or Wi-Fi during exams
- Students have access to a smartphone, tablet, or laptop with a modern browser
- Teachers have a desktop/laptop for exam creation and management
- Parents have WhatsApp installed on their phones
- Institutions will provide student and parent phone numbers
- Payment verification (manual) will be done within 24 hours of upload

### 7.2 Dependencies

- Meta WhatsApp Cloud API: Active business account, configured template, approved phone number
- SendGrid: Verified sender, configured templates
- PostgreSQL: Version 16+, TLS connections enabled
- Redis: Version 7+, persistence enabled
- Internet: Stable connectivity between servers and external APIs

---

## 8. Glossary

| Term | Definition |
|---|---|
| OMR | Optical Mark Recognition — bubble grid UI for answer selection |
| Mode 1 | Exam mode with digital question paper + digital OMR |
| Mode 2 | Exam mode with physical question paper + digital OMR only |
| Tenant | An institution with logically isolated data |
| Auto-save | Periodic persistence of student answers (every 30 seconds) |
| Result Release | Action making scores visible + triggering notifications |
| Bull | Redis-backed job queue |
| UTR | Unique Transaction Reference (bank transfer ID) |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token — stateless auth token |

---

## 9. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 10. Approval Sign-Off

**Document:** DOC 1.4 — Software Requirements Specification
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-14 | ✅ Approved |
