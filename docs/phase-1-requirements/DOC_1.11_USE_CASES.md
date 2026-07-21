# DOC 1.11 — Use Cases

**Document ID:** 1.11
**Title:** Use Cases — EduOMR System Interaction Specifications
**Version:** 1.0.0  
**Status:** Approved  
**Owner:** Product + Engineering
**Date:** 2026-07-14
**Purpose:** Define comprehensive use cases for every major system interaction in EduOMR — covering normal flow, alternative flows, error conditions, and pre/post conditions.

---

## 1. Use Case Format

```
UC-[N]: [Use Case Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actor:         [Role(s) involved]
Goal:          [What the actor wants to achieve]
Preconditions: [What must be true before execution]
Postcondition: [What is true after successful execution]
Trigger:       [What starts the use case]

Main Success Scenario:
1. Step 1
2. Step 2
3. Step 3

Extensions (Alternative Flows):
1a. [Condition]: [Alternative steps]

Error Conditions:
E1. [Error]: [System response]
```

---

## 2. Authentication & Authorization Use Cases

### UC-001: User Login
```
Actor:         Any user with an account
Goal:          Authenticate and obtain access token
Preconditions: User account exists and is active; institution is active
Postcondition: Access token + refresh token issued; session started
Trigger:       User submits login form

Main Success Scenario:
1. User enters email and password
2. System validates input format
3. System looks up user by email
4. System verifies password against stored hash (bcrypt)
5. System checks institution status (must be active)
6. System generates JWT access token (15 min) with payload: userId, tenantId, role
7. System generates refresh token (7 days), sets as httpOnly cookie
8. System returns access token + user profile (name, email, role)
9. User is redirected to their role-based dashboard

Extensions:
2a. Invalid email format: Return 400 with validation error
4a. Incorrect password: Increment failed attempt counter; if >= 10, lock account; return 401
5a. Institution disabled: Return 403 with code INSTITUTION_DISABLED
5b. Subscription expired: Return 402 with code SUBSCRIPTION_EXPIRED

Error Conditions:
E1. Email not found: Return 401 "Invalid email or password" (generic — no user enumeration)
E2. Rate limit exceeded: Return 429 "Too many attempts. Try again in 60 seconds."
E3. Account locked: Return 423 "Account locked due to too many failed attempts. Contact admin."
```

### UC-002: Token Refresh
```
Actor:         Authenticated user with expired access token
Goal:          Obtain new access token without re-login
Preconditions: Refresh token cookie exists and is valid
Postcondition: New access token issued; old refresh token invalidated
Trigger:       Client receives 401 and calls refresh endpoint

Main Success Scenario:
1. Client sends request with refresh token cookie
2. System verifies refresh token signature and expiry
3. System looks up refresh token in database/whitelist
4. System generates new access token (15 min)
5. System rotates refresh token (new JWT, invalidate old)
6. System returns new access token + sets new refresh cookie
7. Client retries original request with new access token

Extensions:
3a. Token not in whitelist (already used): Return 401; force re-login
3b. Token expired: Return 401; force re-login

Error Conditions:
E1. No refresh cookie: Return 401 with code NO_REFRESH_TOKEN
E2. Invalid token signature: Return 401 with code INVALID_TOKEN
```

### UC-003: Password Reset
```
Actor:         Any registered user
Goal:          Reset forgotten password
Preconditions: User knows their registered email
Postcondition: New password set; old sessions invalidated
Trigger:       User clicks "Forgot Password"

Main Success Scenario:
1. User enters registered email on forgot password page
2. System validates email exists (no disclosure if doesn't)
3. System generates crypto-random reset token (32 bytes, hex-encoded)
4. System stores token hash + expiry (1 hour) in database
5. System sends email with reset link containing token
6. User clicks link, lands on reset password page
7. User enters new password twice
8. System validates token (not expired, correct hash)
9. System updates password hash (bcrypt, 12 rounds)
10. System invalidates all refresh tokens for this user
11. System marks reset token as used
12. User redirected to login with success message

Extensions:
5a. Email send fails: Log error; show "If email exists, reset link has been sent."

Error Conditions:
E1. Token expired: Show "Reset link expired. Request a new one."
E2. Invalid token: Show "Invalid reset link."
E3. Weak password: Return 400 with password requirements.
```

---

## 3. Institution & Subscription Use Cases

### UC-004: Institution Registration
```
Actor:         Super Admin
Goal:          Register a new institution on the platform
Preconditions: Super Admin is authenticated
Postcondition: Institution created; Institution Admin account created
Trigger:       Super Admin fills and submits registration form

Main Success Scenario:
1. Super Admin enters institution details (name, address, contact)
2. Super Admin enters admin details (name, email, phone)
3. System validates all fields
4. System generates unique tenant_id (UUID)
5. System creates institution record (status: pending)
6. System generates temporary password (crypto-random, 12 chars)
7. System creates Institution Admin user (role: admin, tenant_id set)
8. System sends welcome email to admin with login credentials
9. System returns institution details

Error Conditions:
E1. Email already registered: Return 409 "Email already in use."
E2. Institution name already exists: Return 409 "Institution name already registered."
```

### UC-005: Subscription Payment Upload
```
Actor:         Institution Admin
Goal:          Upload payment proof to activate subscription
Preconditions: Institution Admin is authenticated; subscription plan selected
Postcondition: Payment record created (status: pending)
Trigger:       Admin uploads screenshot and enters UTR

Main Success Scenario:
1. Admin selects subscription plan
2. Admin uploads payment screenshot (PNG/JPG, max 5MB)
3. Admin enters UTR number and amount paid
4. System validates file type and size
5. System creates payment_upload record (status: pending)
6. System notifies Super Admin (in-app + email)
7. System returns success with payment record ID

Extensions:
3a. UTR already used: Return 409 "UTR number already used for another payment."

Error Conditions:
E1. Invalid file type: Return 400 "Only PNG and JPG files accepted."
E2. File too large: Return 400 "File exceeds 5MB limit."
E3. Amount mismatch: Return 400 "Amount does not match plan price."
```

### UC-006: Payment Verification & Subscription Activation
```
Actor:         Super Admin
Goal:          Verify payment and activate subscription
Preconditions: Super Admin is authenticated; pending payment exists
Postcondition: Subscription activated; institution can access platform
Trigger:       Super Admin opens pending payment

Main Success Scenario:
1. Super Admin views pending payments list
2. Super Admin opens specific payment record
3. System shows payment details with screenshot (image preview)
4. Super Admin verifies UTR, amount, and screenshot match
5. Super Admin clicks "Verify"
6. System creates subscription record (plan_id, start_date, end_date)
7. System updates institution subscription status to active
8. System sends confirmation notification to Institution Admin

Extensions:
5a. Rejection: Admin enters reason, clicks "Reject"
    - System sets payment status to rejected
    - System sends rejection notification with reason

Error Conditions:
E1. Concurrent verification: Return 409 "Payment already verified by another admin."
```

---

## 4. User Management Use Cases

### UC-007: Bulk Student Import
```
Actor:         Institution Admin
Goal:          Import multiple students at once via CSV
Preconditions: Admin is authenticated; classes and sections exist
Postcondition: Students created and enrolled
Trigger:       Admin uploads CSV file

Main Success Scenario:
1. Admin downloads CSV template (or uses own format)
2. Admin uploads CSV with columns: email, first_name, last_name, phone, class, section
3. System validates CSV structure
4. System validates each row (email format, class exists, section exists)
5. System creates user accounts for valid rows (auto-generated passwords)
6. System enrolls students in specified class + section
7. System generates import report: success count, failure count, errors per row
8. System displays import results to admin

Extensions:
5a. Email already exists within tenant: Skip row, mark as error
6a. Class/section not found for row: Skip row, mark as error

Error Conditions:
E1. Invalid CSV format: Return 400 "CSV must include required columns: email, first_name..."
E2. Empty CSV: Return 400 "CSV file contains no data rows."
E3. Too many rows (>1000): Return 400 "Maximum 1000 students per import."
```

### UC-008: Parent-Student Linking
```
Actor:         Institution Admin
Goal:          Link a parent account to a student
Preconditions: Admin is authenticated; parent and student accounts exist
Postcondition: Parent can view linked student's results
Trigger:       Admin links parent to student

Main Success Scenario:
1. Admin searches for or selects existing parent
2. Admin searches for or selects student
3. System validates parent not already linked to >5 students
4. System creates parent_student link record
5. System confirms link creation

Extensions:
3a. Parent already at max (5): Return 400 "Parent already linked to maximum of 5 students."
3b. Parent already linked to this student: Return 409 "Parent already linked to this student."
```

---

## 5. Academic Structure Use Cases

### UC-009: Class & Subject Setup
```
Actor:         Institution Admin
Goal:          Set up classes and subjects for the academic year
Preconditions: Admin is authenticated; academic year exists
Postcondition: Classes, sections, and subjects created
Trigger:       Admin creates academic structure

Main Success Scenario:
1. Admin creates academic year (name, start_date, end_date, is_current)
2. Admin creates class (name: "Class 10")
3. Admin creates sections under class (name: "Section A", "Section B")
4. Admin creates subjects per class (name: "Mathematics", code: "MTH-10")
5. System validates uniqueness within tenant
6. All records available for enrollment and exam assignment
```

---

## 6. Exam Module Use Cases

### UC-010: Exam Creation
```
Actor:         Teacher
Goal:          Create a new exam with questions
Preconditions: Teacher is authenticated; class and subject exist
Postcondition: Exam created in draft status
Trigger:       Teacher fills exam creation form

Main Success Scenario:
1. Teacher enters exam title, description, date, duration (minutes)
2. Teacher selects exam mode: DIGITAL or PHYSICAL_PAPER
3. Teacher sets scoring config: total_marks, marks_per_correct, marks_per_wrong, negative_marking
4. Teacher selects target class and subject
5. Teacher adds questions (one-by-one or bulk upload)
   - For each question: text, 4 options (A/B/C/D), correct option, marks
6. Teacher optionally uploads answer key
7. Teacher clicks "Save as Draft"
8. System creates exam record (status: draft)
9. System creates question records with sequential numbering
10. System stores answer key (if provided)

Extensions:
5a. Bulk upload: CSV with question_text, option_a, option_b, option_c, option_d, correct_option, marks
6a. Answer key upload: CSV with question_number, correct_option

Error Conditions:
E1. No questions added: Return 400 "At least one question required."
E2. Duration exceeds max: Return 400 "Maximum exam duration is 480 minutes."
E3. Marks config invalid: Return 400 "Total marks must equal sum of question marks."
```

### UC-011: Start Exam Session
```
Actor:         Student
Goal:          Start an exam session
Preconditions: Student is authenticated; exam is published; within scheduled window
Postcondition: Exam session created (status: in_progress)
Trigger:       Student clicks "Start Exam"

Main Success Scenario:
1. Student views exam lobby
2. Student clicks "Start Exam" on a published exam
3. System checks exam is within scheduled window
4. System checks no existing session for this student + exam
5. System creates exam_session record (status: in_progress)
6. System calculates deadline = MIN(scheduled_at + duration, exam.deadline_at)
7. System returns session_id and redirects to exam page

Extensions:
3a. Before scheduled window: Button disabled "Exam starts on [date] at [time]"
3b. After deadline: Button disabled "Exam ended on [date] at [time]"
4a. Existing in-progress session: Resume existing session
4b. Existing submitted session: Redirect to result view (if released)

Error Conditions:
E1. Exam not published: Return 403 "Exam is not yet published."
E2. Student not enrolled: Return 403 "You are not enrolled in the class for this exam."
```

### UC-012: Auto-Save Answers
```
Actor:         Student (system-triggered)
Goal:          Persist student answers periodically
Preconditions: Active exam session exists; answers may have changed
Postcondition: Latest answers saved to database
Trigger:       Client timer fires (every 30 seconds) or answer changed

Main Success Scenario:
1. Client collects all answers from current session
2. Client sends POST /exam-sessions/:id/save with { answers: [{ question_number, selected_option }] }
3. Server validates session is still in_progress
4. Server validates deadline not passed
5. Server upserts student_answers for each question
   - If answer exists: update selected_option, is_saved = true, updated_at = NOW()
   - If new: create record
6. Server returns { saved: true, saved_at: "ISO-8601" }
7. Client updates "Last saved at [time]" indicator

Extensions:
3a. Session submitted: Return 400 "Exam already submitted. Answers cannot be changed."
4a. Deadline passed: Return 422 with code EXAM_TIME_EXPIRED
    - Client should trigger auto-submit flow

Error Conditions:
E1. Network error: Client retries with exponential backoff (max 3 times)
E2. Invalid question number: Return 400 "Question number out of range."
E3. Invalid option: Return 400 "Option must be A, B, C, D, or null."
```

### UC-013: Manual Exam Submit
```
Actor:         Student
Goal:          Submit completed exam before deadline
Preconditions: Active exam session in_progress; deadline not passed
Postcondition: Session status = submitted; score calculated
Trigger:       Student clicks Submit button and confirms

Main Success Scenario:
1. Student clicks "Submit Exam" button (always visible)
2. System shows confirmation dialog: "Are you sure? You have X minutes remaining."
3. Student confirms
4. System saves all pending answers (failsafe)
5. System updates exam_session status to submitted, records submitted_at
6. System triggers score calculation (UC-015)
7. System redirects student to exam lobby

Extensions:
2a. Student cancels: Dialog closes, exam continues

Error Conditions:
E1. Deadline already passed: Submit rejected; redirect to lobby with "Exam time expired."
E2. Session already submitted: Return 400 "Exam already submitted."
```

### UC-014: Auto-Submit at Deadline
```
Actor:         System (Bull scheduled job)
Goal:          Auto-submit all in-progress sessions at exam deadline
Preconditions: Exam deadline has passed
Postcondition: All in-progress sessions submitted; scores calculated
Trigger:       Scheduled Bull job fires

Main Success Scenario:
1. Bull job fires for exam at deadline time
2. System queries all exam_sessions where exam_id = X AND status = 'in_progress'
3. For each session:
   a. Save any existing answers as final
   b. Update session status to auto_submitted
   c. Set submitted_at = deadline_at
   d. Trigger score calculation (UC-015)
4. System logs auto-submit count for audit
5. Teacher receives notification that exam has ended

Extensions:
3a. Session had no answers: Create empty result (all skipped)
2a. No in-progress sessions: Job completes with no action

Error Conditions:
E1. Job fails: Retry 2 times; if still fails, alert on-call engineer
E2. Partial failure: Log failed sessions; alert for manual review
```

### UC-015: Score Calculation
```
Actor:         System (triggered by submit or auto-submit)
Goal:          Calculate score and store result
Preconditions: Exam session submitted; answer key exists
Postcondition: Result record created; rank calculated
Trigger:       Manual submit, auto-submit, or answer key correction

Main Success Scenario:
1. System retrieves all student_answers for the session
2. System retrieves answer_key for the exam
3. System retrieves exam configuration (marks_per_correct, marks_per_wrong, negative_marking)
4. For each question:
   a. If student_answer is NULL → increment skipped_count
   b. If student_answer == correct_answer → increment correct_count, add marks_per_correct to score
   c. If student_answer != correct_answer → increment wrong_count
      If negative_marking: subtract marks_per_wrong from score
5. Calculate total_score = MAX(score, 0) — clamp to zero
6. Calculate percentage = ROUND((total_score / total_marks) * 100, 2)
7. Create result record with: total_score, total_marks, correct_count, wrong_count, skipped_count, percentage
8. Create question_result records for each question: question_id, student_answer, correct_answer, is_correct, marks_awarded
9. Trigger rank recalculation for this exam (UC-016)

Extensions:
1a. No student answers found: All questions marked as skipped
3a. Answer key missing: Return error "Answer key not found. Contact teacher."

Error Conditions:
E1. Score calculation race condition: DB lock on session ID prevents double calculation
E2. DB write failure: Log error; retry; alert if persistent
```

### UC-016: Rank Calculation
```
Actor:         System (triggered by score calculation or result release)
Goal:          Calculate student's rank among all exam takers
Preconditions: At least one result exists for the exam
Postcondition: Rank assigned to all results
Trigger:       New score calculated, or teacher manually requests recalc

Main Success Scenario:
1. System queries all results for the exam, ordered by percentage DESC
2. System assigns dense rank (same percentage = same rank)
3. System updates rank and total_students on each result record
4. Rank values: 1, 2, 2, 3, 4... (dense ranking)

Extensions:
1a. Fewer than 2 results: Rank = 1, total_students = count
```

### UC-017: Result Release
```
Actor:         Teacher
Goal:          Release exam results to students and trigger notifications
Preconditions: Teacher is authenticated; exam deadline passed; scores calculated; result not yet released
Postcondition: Results visible to students; WhatsApp jobs queued
Trigger:       Teacher clicks "Release Result"

Main Success Scenario:
1. Teacher navigates to exam result page
2. Teacher reviews summary (scores calculated, awaiting release)
3. Teacher clicks "Release Result"
4. System shows confirmation dialog: "Results will be visible to all students. WhatsApp notifications will be sent to parents. Continue?"
5. Teacher confirms
6. System updates exam status to results_released
7. System updates all results: is_released = true, released_at = NOW()
8. For each student result with linked parent:
   System queues Bull job to send WhatsApp notification
9. System returns 200 immediate success
10. Student result pages become accessible

Extensions:
4a. Teacher cancels: No action taken
8a. No linked parent: Skip WhatsApp; log "No parent linked"
8b. Parent has no phone: Skip WhatsApp; log "Parent has no phone number"

Error Conditions:
E1. Exam deadline not passed: Return 400 "Cannot release results before exam deadline."
E2. Results already released: Return 409 "Results already released."
E3. No answer key: Return 400 "Cannot release results without answer key."
```

### UC-018: WhatsApp Notification Delivery
```
Actor:         System (Bull worker)
Goal:          Send exam result to parent via WhatsApp
Preconditions: Result released; parent has phone number; Meta API available
Postcondition: Notification logged; parent receives WhatsApp
Trigger:       Bull job dequeue

Main Success Scenario:
1. Bull worker picks up notification job
2. Worker composes message using template: "Dear {{parentName}}, your child {{studentName}} scored {{score}} out of {{totalMarks}} in {{examTitle}}. Rank: {{rank}} out of {{totalStudents}}. — EduOMR"
3. Worker calls Meta WhatsApp Cloud API
4. Worker logs success to notification_logs (channel: whatsapp, status: sent)
5. Job completes successfully

Extensions:
3a. API returns rate limit error: Wait 30 seconds, retry (up to 3 times)
3b. API returns auth error: Log critical error; alert on-call
4a. Attempt 1-2 fails: Retry with exponential backoff (2s, 4s)
4b. Attempt 3 fails: Send email fallback (UC-019); log as failed
4c. Email also fails: Move job to dead-letter queue; log as dead_letter

Error Conditions:
E1. Invalid phone number: Log error; mark as failed (no retry)
E2. Template not approved: Log critical error; alert Super Admin
```

### UC-019: Email Fallback Notification
```
Actor:         System (Bull worker)
Goal:          Send exam result to parent via email when WhatsApp fails
Preconditions: WhatsApp notification failed after 3 retries; parent has email
Postcondition: Email sent; notification logged
Trigger:       WhatsApp job fails on 3rd attempt

Main Success Scenario:
1. WhatsApp worker fails on 3rd retry
2. Worker checks parent has email address
3. Worker composes email with same message content
4. Worker sends via Nodemailer → SendGrid
5. Worker logs to notification_logs (channel: email, status: sent)
6. Job completes

Extensions:
3a. Parent has no email: Log "No email fallback available"; move to dead-letter queue
4a. Email send fails: Log; move to dead-letter queue

Error Conditions:
E1. SendGrid API error: Retry once; if fails, move to dead-letter queue
```

---

## 7. Exam Session Mode Use Cases

### UC-020: Load Exam — Mode 1 (Digital Paper)
```
Actor:         Student
Goal:          View questions and OMR grid simultaneously
Preconditions: Active exam session in_progress; exam mode is DIGITAL
Postcondition: Questions + grid displayed on device
Trigger:       Student starts exam or page refresh

Main Success Scenario:
1. Student starts or resumes exam
2. Client calls GET /exam-sessions/:id/mode1
3. Server returns:
   - questions: [{ number, text, options: {A, B, C, D} }]
   - omr_state: [{ question_number, selected_option or null }]
   - timer: remaining_seconds
   - session_status: in_progress
4. Client renders question panel (left) + OMR grid (right)
5. Previously saved answers are pre-selected in grid

Security Constraints:
- Server does NOT include correct_answer in response
- Server does NOT include answer_key in response
- Server validates session belongs to requesting student

Error Conditions:
E1. Exam mode is PHYSICAL_PAPER: Return 400 "This is a Mode 2 exam. Use Mode 2 endpoint."
```

### UC-021: Load Exam — Mode 2 (Physical Paper)
```
Actor:         Student
Goal:          View OMR grid only (no questions)
Preconditions: Active exam session in_progress; exam mode is PHYSICAL_PAPER
Postcondition: OMR grid displayed; instruction banner shown
Trigger:       Student starts or resumes exam

Main Success Scenario:
1. Student starts or resumes exam
2. Client calls GET /exam-sessions/:id/mode2
3. Server returns:
   - omr_state: [{ question_number, selected_option or null }]
   - timer: remaining_seconds
   - session_status: in_progress
   - instruction_banner: "Answer according to your physical question paper"
4. Client renders OMR grid ONLY (full screen)
5. Instruction banner is displayed prominently
6. Previously saved answers are pre-selected in grid

Security Constraints:
- Server returns NO question text, NO options, NO hints of any kind
- API contract explicitly excludes question data for Mode 2
- Server validates session belongs to requesting student

Error Conditions:
E1. Exam mode is DIGITAL: Return 400 "This is a Mode 1 exam. Use Mode 1 endpoint."
```

---

## 8. Result Viewing Use Cases

### UC-022: View Student Result
```
Actor:         Student
Goal:          View exam result after release
Preconditions: Result released; student is the session owner
Postcondition: Result displayed
Trigger:       Student clicks "View Result"

Main Success Scenario:
1. Student navigates to exam lobby
2. Student clicks "View Result" on completed exam
3. Client calls GET /api/v1/results/my?exam_id=X
4. Server returns:
   - total_score, total_marks, percentage, rank, total_students
   - correct_count, wrong_count, skipped_count
   - breakdown: [{ question_number, student_answer, correct_answer, is_correct, marks_awarded }]
5. Client renders result view

Security Constraints:
- Only visible if is_released = true
- Student can only see their own result

Error Conditions:
E1. Results not released: Return 403 "Results not yet released."
E2. Not your result: Return 403 "You can only view your own results."
```

### UC-023: View Child's Result (Parent)
```
Actor:         Parent
Goal:          View linked student's exam result
Preconditions: Parent authenticated; parent linked to student; result released
Postcondition: Result displayed
Trigger:       Parent navigates to child's result

Main Success Scenario:
1. Parent logs in and sees linked children
2. Parent selects a child
3. Parent sees list of exams with released results
4. Parent clicks an exam to view result
5. System returns same result data as UC-022

Security Constraints:
- Parent can only view results of linked students
- Max 5 students per parent
```

---

## 9. Use Case Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────┐
│                      EduOMR System                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Platform    │  │  Super Admin │  │  Institution  │     │
│  │  Owner       │  │              │  │  Admin        │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│  ┌──────▼─────────────────▼─────────────────▼──────┐      │
│  │           Institution Management                │      │
│  │  UC-004 ── Register Institution                  │      │
│  │  UC-005 ── Upload Payment                        │      │
│  │  UC-006 ── Verify Payment                        │      │
│  │  UC-007 ── Bulk Import Students                  │      │
│  │  UC-008 ── Link Parent to Student                │      │
│  │  UC-009 ── Setup Academic Structure              │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Teacher     │  │  Student     │  │  Parent      │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│  ┌──────▼─────────────────▼─────────────────▼──────┐      │
│  │              Exam Management                     │      │
│  │  UC-010 ── Create Exam                           │      │
│  │  UC-011 ── Start Exam Session                    │      │
│  │  UC-012 ── Auto-Save Answers                     │      │
│  │  UC-013 ── Manual Submit                         │      │
│  │  UC-014 ── Auto-Submit (System)                  │      │
│  │  UC-020 ── Load Mode 1 (Questions + OMR)        │      │
│  │  UC-021 ── Load Mode 2 (OMR Only)               │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Scoring & Notifications               │    │
│  │  UC-015 ── Score Calculation                        │    │
│  │  UC-016 ── Rank Calculation                         │    │
│  │  UC-017 ── Result Release                           │    │
│  │  UC-018 ── WhatsApp Notification                    │    │
│  │  UC-019 ── Email Fallback                           │    │
│  │  UC-022 ── View Result (Student)                   │    │
│  │  UC-023 ── View Result (Parent)                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│              Actors:  ↑ Admin  ↑ Teacher  ↑ Student  ↑ Parent
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Use Case to Module Mapping

| Use Case | Module | Priority |
|---|---|---|
| UC-001: User Login | Auth | P0 |
| UC-002: Token Refresh | Auth | P0 |
| UC-003: Password Reset | Auth | P0 |
| UC-004: Institution Registration | Institution | P0 |
| UC-005: Payment Upload | Subscription | P0 |
| UC-006: Payment Verification | Subscription | P0 |
| UC-007: Bulk Student Import | Users | P0 |
| UC-008: Parent-Student Linking | Users | P0 |
| UC-009: Academic Setup | Academic | P0 |
| UC-010: Exam Creation | Exam | P0 |
| UC-011: Start Exam Session | Exam Session | P0 |
| UC-012: Auto-Save Answers | Exam Session | P0 |
| UC-013: Manual Submit | Exam Session | P0 |
| UC-014: Auto-Submit | Exam Session | P0 |
| UC-015: Score Calculation | Score | P0 |
| UC-016: Rank Calculation | Score | P0 |
| UC-017: Result Release | Result | P0 |
| UC-018: WhatsApp Notification | Notification | P0 |
| UC-019: Email Fallback | Notification | P0 |
| UC-020: Load Mode 1 | Exam Session | P0 |
| UC-021: Load Mode 2 | Exam Session | P0 |
| UC-022: View Student Result | Result | P0 |
| UC-023: View Child's Result | Result | P0 |

---

## 11. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 12. Approval Sign-Off

**Document:** DOC 1.11 — Use Cases
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-14 | ✅ Approved |
