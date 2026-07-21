# DOC 1.10 — User Stories

**Document ID:** 1.10
**Title:** User Stories — EduOMR Feature Narratives by Role
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Product Management
**Date:** 2026-07-14
**Purpose:** Define user stories for every feature in the MVP, organized by user role, with acceptance criteria and priority.

---

## 1. User Story Format

```
As a [role], I want to [action] so that [benefit].

Acceptance Criteria:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

Priority: P0/P1/P2
```

---

## 2. Platform Owner Stories

### PO-1: Platform Overview
```
As a Platform Owner, I want to see a dashboard of all institutions
so that I can monitor platform growth and health.

Acceptance Criteria:
- Dashboard shows total institutions, active institutions, total students
- Dashboard shows MRR and subscription counts
- Dashboard shows recent signups and expiring subscriptions
- Data is tenant-isolated (platform-wide view)

Priority: P0
```

### PO-2: Institution Management
```
As a Platform Owner, I want to view and manage all institutions
so that I can ensure platform quality and address issues.

Acceptance Criteria:
- Can list all institutions with status filter (active/pending/disabled)
- Can view institution details (users, subscription, activity)
- Can disable institution in case of abuse
- All actions are logged for audit

Priority: P0
```

---

## 3. Super Admin Stories

### SA-1: Institution Registration
```
As a Super Admin, I want to register new institutions
so that they can start using the platform.

Acceptance Criteria:
- Can create institution with name, address, contact details
- System auto-creates Institution Admin account
- Institution starts in "pending" status
- Confirmation sent to institution admin email

Priority: P0
```

### SA-2: Payment Verification
```
As a Super Admin, I want to view and verify payment uploads
so that institutions can activate their subscriptions.

Acceptance Criteria:
- List shows all pending payments with screenshot preview
- Can click Verify to activate subscription for chosen plan duration
- Can click Reject with reason
- Institution admin is notified of verification result

Priority: P0
```

### SA-3: Subscription Plan Management
```
As a Super Admin, I want to create and manage subscription plans
so that institutions can choose the right plan for their needs.

Acceptance Criteria:
- Can create plans with name, price, duration, max_students, features
- Can update plan details
- Can enable/disable plans
- Active plans shown during institution subscription

Priority: P0
```

---

## 4. Institution Admin Stories

### IA-1: Institution Setup
```
As an Institution Admin, I want to set up my institution profile
so that my institution information is correct on the platform.

Acceptance Criteria:
- Can update institution name, address, contact details
- Can view current subscription status and expiry date
- Can view usage (active students, exams conducted)

Priority: P0
```

### IA-2: Teacher Management
```
As an Institution Admin, I want to add and manage teachers
so that they can create and manage exams.

Acceptance Criteria:
- Can create teacher account with name, email, phone
- Can bulk import teachers via CSV
- Can view list of all teachers with status
- Can disable a teacher account
- Can reset teacher password

Priority: P0
```

### IA-3: Student Management
```
As an Institution Admin, I want to add and manage students
so that they can take exams.

Acceptance Criteria:
- Can create student account with name, email, phone
- Can bulk import students via CSV (name, email, phone, class, section)
- Can view list of all students with class/section
- Can disable a student account

Priority: P0
```

### IA-4: Parent Linking
```
As an Institution Admin, I want to link parents to students
so that parents can receive exam results.

Acceptance Criteria:
- Can create parent account or select existing parent
- Can link parent to 1-5 students
- Can view parent-student relationships
- Parent can see only linked students' results

Priority: P0
```

### IA-5: Academic Structure
```
As an Institution Admin, I want to set up academic years, classes, sections, and subjects
so that exams can be organized by academic structure.

Acceptance Criteria:
- Can create, edit, delete academic years
- Can set one academic year as current
- Can create classes (e.g., Class 10) and sections (e.g., Section A)
- Can create subjects per class
- Can enroll students in class + section

Priority: P0
```

### IA-6: Subscription Payment
```
As an Institution Admin, I want to view subscription plans and make payments
so that my institution can continue using the platform.

Acceptance Criteria:
- Can view available subscription plans with pricing
- Can upload payment screenshot and enter UTR number
- Can see payment status (pending/verified/rejected)
- Can view subscription active period after verification

Priority: P0
```

---

## 5. Teacher Stories

### T-1: Exam Creation
```
As a Teacher, I want to create a new exam
so that I can assess my students.

Acceptance Criteria:
- Can create exam with title, description, date, duration
- Can select mode (Digital Paper or Physical Paper)
- Can set total marks, marks per correct, negative marking
- Can select target class and subject
- Exam is saved as "draft" initially

Priority: P0
```

### T-2: Question Management
```
As a Teacher, I want to add questions to my exam
so that students can answer them.

Acceptance Criteria:
- Can add questions one by one (question text, 4 options, correct answer, marks)
- Can bulk upload questions via CSV/Excel
- Can reorder questions
- Can edit or delete questions before publishing
- Questions are numbered sequentially

Priority: P0
```

### T-3: Answer Key Upload
```
As a Teacher, I want to upload the answer key for my exam
so that student responses can be auto-evaluated.

Acceptance Criteria:
- Can upload answer key (question number → correct option mapping)
- Can upload via form or bulk CSV
- Answer key is stored server-side only
- Answer key is NOT included in any student-facing API response

Priority: P0
```

### T-4: Exam Publish
```
As a Teacher, I want to publish my exam
so that students can see and start it.

Acceptance Criteria:
- Can click Publish to change status from draft to published
- Published exam appears in assigned students' exam lobby
- Cannot edit questions or answer key after publishing
- Can unpublish only if no student has started

Priority: P0
```

### T-5: Print Question Paper (Mode 2)
```
As a Teacher, I want to print the question paper for a Mode 2 exam
so that I can distribute physical copies in class.

Acceptance Criteria:
- Can click "Print Question Paper" to generate PDF
- PDF contains all questions with options, formatted for printing
- PDF auto-downloads
- PDF generation is async (queued if large)

Priority: P0
```

### T-6: Live Exam Monitor
```
As a Teacher, I want to monitor exam progress in real-time
so that I can see which students have started and submitted.

Acceptance Criteria:
- Dashboard shows exam status, timer for in-progress sessions
- Shows list of students with status (not started / in progress / submitted)
- Updates periodically (auto-refresh every 30 seconds)
- Shows count of submitted vs total students

Priority: P0
```

### T-7: Result Release
```
As a Teacher, I want to release results for an exam
so that students and parents can see scores.

Acceptance Criteria:
- Can click "Release Result" after exam deadline has passed
- Confirmation dialog explains impact (visible to students, WhatsApp sent)
- On confirm: exam status changes to results_released
- All students can immediately view their results
- WhatsApp notification jobs are queued for parents

Priority: P0
```

### T-8: Result View (Teacher)
```
As a Teacher, I want to view exam results
so that I can analyze student performance.

Acceptance Criteria:
- Can view summary (average score, highest, lowest, pass percentage)
- Can view per-student scores list
- Can view per-question analytics (how many students answered correctly)
- Can export results (future: CSV download)

Priority: P0
```

### T-9: Question Bank (P1)
```
As a Teacher, I want to save and reuse questions across exams
so that I don't have to create the same questions repeatedly.

Acceptance Criteria:
- Can save questions to a question bank
- Can browse and search question bank
- Can import questions from bank to new exam

Priority: P1
```

---

## 6. Student Stories

### S-1: Exam Lobby
```
As a Student, I want to see my upcoming and available exams
so that I know which exams to take.

Acceptance Criteria:
- Shows list of published exams assigned to my class
- Shows exam title, subject, date, duration, status
- Shows "Start Exam" button only when within scheduled window
- Completed exams show "View Result" if results released

Priority: P0
```

### S-2: Take Exam — Mode 1 (Digital Paper)
```
As a Student, I want to read questions and mark answers on the same screen
so that I can complete my exam efficiently.

Acceptance Criteria:
- Left panel shows questions with options
- Right panel shows OMR bubble grid
- Both panels visible simultaneously on desktop
- OMR bubbles are at least 44x44px
- Clicking an option in question panel also updates OMR
- Clicking a bubble in OMR grid also selects in question panel
- Questions can be navigated with Previous/Next buttons
- Answered questions are visually marked in navigator

Priority: P0
```

### S-3: Take Exam — Mode 2 (Physical Paper + Digital OMR)
```
As a Student, I want to mark answers on the digital OMR sheet
while reading from my physical question paper.

Acceptance Criteria:
- NO question text or options shown on screen
- Only OMR bubble grid is displayed
- Banner says "Answer according to your physical question paper"
- OMR bubbles are 44x44px minimum
- Progress bar shows filled/skipped count
- Timer is visible at all times

Priority: P0
```

### S-4: Auto-Save
```
As a Student, I want my answers to be saved automatically
so that I don't lose my work if the network drops.

Acceptance Criteria:
- Answers auto-save every 30 seconds
- Visual indicator shows last save time ("Saved at 10:32 AM")
- On network reconnect, unsaved answers are synced
- No answer loss on accidental page refresh (within session)

Priority: P0
```

### S-5: Timer & Deadline
```
As a Student, I want to see remaining time clearly
so that I can manage my exam pace.

Acceptance Criteria:
- Timer displayed prominently, updates every second
- Timer turns red when < 5 minutes remaining
- Timer shows hours:minutes:seconds format
- Server auto-submits when timer reaches zero

Priority: P0
```

### S-6: Submit Exam
```
As a Student, I want to submit my exam when I finish
so that my answers are evaluated.

Acceptance Criteria:
- Submit button always accessible
- Confirmation dialog: "Are you sure? You have X minutes remaining."
- On confirm: session status changes to "submitted"
- Answers are final — no edits after submission
- Redirected to exam lobby

Priority: P0
```

### S-7: View Result
```
As a Student, I want to view my exam result
so that I know my score and performance.

Acceptance Criteria:
- Shows total score, percentage, rank
- Shows correct/wrong/skipped counts
- Shows per-question breakdown (my answer vs correct answer)
- Result visible only after teacher releases it
- Mobile-responsive layout

Priority: P0
```

---

## 7. Parent Stories

### P-1: Receive WhatsApp Result
```
As a Parent, I want to receive exam results on WhatsApp
so that I can track my child's performance immediately.

Acceptance Criteria:
- Receive WhatsApp message when teacher releases results
- Message includes: child name, score, total marks, exam name, rank
- Message delivered within 5 minutes of release
- No action needed from parent to receive

Priority: P0
```

### P-2: View Detailed Result
```
As a Parent, I want to view my child's detailed exam result
so that I can see their performance breakdown.

Acceptance Criteria:
- Can log in and see linked children's results
- Shows score, percentage, rank per exam
- Shows per-question breakdown (correct/wrong/skipped)
- Cannot see other students' results

Priority: P0
```

---

## 8. Story Point Estimates (For Sprint Planning)

| Story | Role | Story Points | Sprint |
|---|---|---|---|
| PO-1 | Platform Owner | 3 | Sprint I |
| PO-2 | Platform Owner | 5 | Sprint C |
| SA-1 | Super Admin | 3 | Sprint C |
| SA-2 | Super Admin | 5 | Sprint C |
| SA-3 | Super Admin | 3 | Sprint C |
| IA-1 | Admin | 2 | Sprint C |
| IA-2 | Admin | 5 | Sprint D |
| IA-3 | Admin | 5 | Sprint D |
| IA-4 | Admin | 3 | Sprint D |
| IA-5 | Admin | 5 | Sprint E |
| IA-6 | Admin | 3 | Sprint C |
| T-1 | Teacher | 5 | Sprint F |
| T-2 | Teacher | 8 | Sprint F |
| T-3 | Teacher | 3 | Sprint F |
| T-4 | Teacher | 2 | Sprint F |
| T-5 | Teacher | 5 | Sprint H |
| T-6 | Teacher | 5 | Sprint F |
| T-7 | Teacher | 3 | Sprint G |
| T-8 | Teacher | 5 | Sprint G |
| S-1 | Student | 3 | Sprint J |
| S-2 | Student | 13 | Sprint J |
| S-3 | Student | 8 | Sprint J |
| S-4 | Student | 5 | Sprint F |
| S-5 | Student | 3 | Sprint F |
| S-6 | Student | 3 | Sprint F |
| S-7 | Student | 5 | Sprint G |
| P-1 | Parent | 5 | Sprint H |
| P-2 | Parent | 3 | Sprint J |

**Total Story Points: ~125**

**Team Velocity Estimate:** 12-15 story points per sprint (5-6 engineers)
**Estimated Sprints:** 10 sprints (aligned with Phase 3 sprint plan)

---

## 9. Story Mapping Summary

```
Role        ┃ Auth  Inst  Sub  Users  Acad  Exam  Score  Notif  FE  ExamUI
────────────╂───────────────────────────────────────────────────────────────
Platform    ┃                 PO-2                       PO-1
Super Admin ┃       SA-1   SA-2
            ┃               SA-3
Admin       ┃       IA-1   IA-6  IA-2   IA-5
            ┃                     IA-3
            ┃                     IA-4
Teacher     ┃                         T-1   T-7    T-5     T-8
            ┃                         T-2   T-8
            ┃                         T-3
            ┃                         T-4
            ┃                         T-6
Student     ┃                         S-2   S-7            S-1   S-2
            ┃                         S-3                  S-7   S-3
            ┃                         S-4
            ┃                         S-5
            ┃                         S-6
Parent      ┃                                    P-1       P-2
```

---

## 10. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 11. Approval Sign-Off

**Document:** DOC 1.10 — User Stories
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Product Lead | opencode | 2026-07-14 | ✅ Approved |
