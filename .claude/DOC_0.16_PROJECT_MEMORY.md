# DOC 0.16 — Project Memory

**Document ID:** 0.16  
**Title:** Project Memory — Persistent Knowledge and Working Conventions  
**Version:** 1.0.0  
**Status:** Approved  
**Owner:** Project Memory Governance  
**Date:** 2026-07-13  
**Purpose:** Define the memory and knowledge retention rules for EduOMR so that future work stays consistent, traceable, and aligned with the approved project knowledge base.

---

## 1. Mission

The Project Memory document defines what should be remembered across sessions, what should be recorded for the repository, and how future AI agents and contributors should use project memory safely and consistently.

**Core Principle:**
> If the project learned something important, it should be recorded once and reused correctly.

This applies to:
- Process conventions
- Architecture decisions
- Coding conventions
- Review outcomes
- Repeated mistakes and lessons learned
- Repository-specific build and validation facts

---

## 2. Memory Types

### 2.1 User Memory

User memory is persistent across conversations and workspaces.

**Use for:**
- Stable preferences
- Repeated conventions
- Long-lived user instructions
- General project behavior facts

**Do not use for:**
- Secrets
- Temporary tasks
- Sensitive identifiers
- Large documents

### 2.2 Session Memory

Session memory is temporary and specific to the current conversation.

**Use for:**
- In-progress plans
- Current task state
- Temporary assumptions
- Short-lived decisions

**Do not use for:**
- Permanent project facts
- Secrets
- Long-term documentation

### 2.3 Repository Memory

Repository memory is scoped to the current codebase.

**Use for:**
- Build commands
- Folder structure facts
- Known constraints
- Verified conventions
- Testing commands
- Module ownership notes

---

## 3. What Should Be Remembered

### 3.1 Stable Facts

Record facts that are unlikely to change often, such as:
- Locked technology stack
- Terminology lock
- Module boundaries
- Common build and test commands
- Review workflow conventions
- Known architecture rules

### 3.2 Lessons Learned

Record repeated issues or important lessons, such as:
- A certain pattern caused bugs
- A command worked reliably
- A review check caught a common issue
- A migration approach should not be repeated

### 3.3 Project Decisions

Record approved decisions such as:
- Architecture choices
- Security conventions
- UI/UX conventions
- Testing conventions
- Deployment facts

---

## 4. What Should Not Be Remembered

Do not store:
- Passwords
- API keys
- Tokens
- Personal data that is not needed
- Large raw documents
- Duplicate content that already exists in approved docs
- Unverified assumptions

---

## 5. Memory Writing Rules

### 5.1 Keep Memory Short

Memory entries must be concise and specific.

**Good:**
- `Use tenant_id from JWT only; never from request input.`
- `npm test is the standard test command for this repo.`

**Bad:**
- Long narrative summaries
- Duplicate copies of the full PROJECT_KNOWLEDGE.md

### 5.2 One Fact Per Entry

Prefer one clear fact per note so it can be reused easily.

### 5.3 Update, Don’t Duplicate

If a memory fact changes, update the existing entry rather than creating a duplicate.

### 5.4 Verify Before Recording

Only write memory that has been confirmed by a document, repository check, or validated result.

---

## 6. Repository Memory Contents

Repository memory should include:
- Project name and scope
- Verified tech stack
- Repository structure
- Working commands
- Test commands
- Lint/format commands
- Known build constraints
- Module ownership and conventions
- Important design decisions

### 6.1 Suggested Repository Memory Topics

- Build process
- Test process
- DB migration process
- API naming conventions
- Review process
- Deployment notes
- Local development instructions

---

## 7. Memory Lifecycle

### 7.1 Create

Create memory when a fact is:
- Verified
- Stable
- Useful later

### 7.2 Update

Update memory when:
- A command changes
- A convention changes
- A decision is superseded

### 7.3 Delete

Delete memory when:
- It is wrong
- It is obsolete
- It is duplicated and no longer needed

---

## 8. Memory Governance Rules

- Memory must not conflict with PROJECT_KNOWLEDGE.md
- Memory must not override approved documents
- Memory must remain concise
- Memory must be scoped correctly
- Memory must not store secrets
- Memory must be reviewed when it affects future work

---

## 9. Memory Review Checklist

```markdown
## Project Memory Review: [Entry/Update]

### Accuracy
- [ ] Fact verified
- [ ] No conflict with approved docs
- [ ] Scope correct

### Usefulness
- [ ] Helpful for future work
- [ ] Short and specific
- [ ] Not duplicative

### Safety
- [ ] No secrets stored
- [ ] No sensitive data stored
- [ ] No incorrect assumptions

### Result
**Status:** ✅ APPROVE / ⚠️ UPDATE / ❌ REJECT
```

---

## 10. Memory Entry Examples

**Good Repository Memory Entries:**
- `Use Express.js + PostgreSQL + Prisma + Redis + Bull as the locked backend stack.`
- `tenant_id must always come from JWT context for tenant-scoped data.`
- `Exam Mode 2 must never send questions to the client.`
- `Result release queues WhatsApp notifications in Bull and returns immediately.`

**Good Session Memory Entries:**
- `Next deliverable is DOC 0.12 after DOC 0.11 is written.`
- `User prefers direct implementation over discussion when the task is clear.`

---

## 11. Memory Sign-Off

This document defines the memory retention strategy for EduOMR.

**Memory is useful only when it is correct, concise, and reusable.**

---

## Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-13 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved after review — memory types, lifecycle, and governance validated |

---

## Approval Sign-Off

**Document:** DOC 0.16 — Project Memory  
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Memory Owner | opencode | 2026-07-14 | ✅ Approved |

---

**Next:** Phase 0 documentation set is complete pending approval
