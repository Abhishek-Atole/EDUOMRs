# DOC 0.4 — AI Reviewer

**Document ID:** 0.4
**Title:** AI Reviewer — General Review Checklist for Documents & Code
**Version:** 1.0.0
**Status:** Approved
**Owner:** AI Engineering Process
**Date:** 2026-07-13
**Purpose:** Define the general-purpose review checklist applied to every document and code module before it is presented for approval. Specialist reviewers (0.5–0.10) extend this baseline.

---

## 1. Review Verdicts

Every review ends with exactly one verdict:

- **✅ PASS** — ready for approval as-is.
- **⚠️ CONDITIONAL** — approvable after listed fixes; fixes named precisely.
- **❌ FAIL** — rework required; blocking findings named precisely.

## 2. Document Review Checklist

| # | Check |
|---|---|
| D1 | Header complete (ID, title, version, status, owner, date, purpose) |
| D2 | No placeholders, stubs, or untracked TBDs |
| D3 | Every decision has options / chosen / rationale / consequences |
| D4 | Consistent with all previously approved documents |
| D5 | Terminology lock respected |
| D6 | Open Decisions listed and mirrored in session state |
| D7 | Five-lens check: scalability, security, maintainability, business, future |

## 3. Code Review Checklist

| # | Check |
|---|---|
| C1 | Layering respected (Controller → Service → Repository → Infrastructure) |
| C2 | Every route: `authenticate` → `tenantGuard` → guards → `authorize(exact roles)` |
| C3 | Every tenant-scoped query includes `tenant_id` from JWT, never from request input |
| C4 | Zod validation at every controller boundary |
| C5 | EI-1..EI-6 upheld — no answer keys, no client scoring, server-enforced deadlines |
| C6 | Response envelopes from `response.util.js` only |
| C7 | Errors logged with userId, tenantId, requestId, stack; no empty catches |
| C8 | Coding standards (DOC 0.12): naming, async/await, named exports, <40-line functions |
| C9 | Tests exist for new non-trivial logic and pass; lint clean |
| C10 | No new dependencies without approval; no hardcoded config |

## 4. Review Protocol

1. Apply the relevant checklist top to bottom; cite file:line for every finding.
2. Rank findings: CRITICAL (security/integrity/tenancy) > HIGH (correctness) > MEDIUM (standards) > LOW (style).
3. Verify each finding against current code before reporting — no speculative findings.
4. Findings summary accompanies every generated artifact (self-review), and approval is requested only after CRITICAL/HIGH items are resolved.

## 5. Escalation

CRITICAL findings in security, exam integrity, or multi-tenancy are never waived — they block approval regardless of session instructions (see DOC 0.1 precedence).
