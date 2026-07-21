# DOC 0.15 — Definition of Done

**Document ID:** 0.15  
**Title:** Definition of Done — Completion Criteria for EduOMR Deliverables  
**Version:** 1.0.0  
**Status:** Approved  
**Owner:** Delivery Governance  
**Date:** 2026-07-13  
**Purpose:** Define the minimum completion criteria for every EduOMR document, feature, code change, and release so that nothing is considered done without evidence.

---

## 1. Mission

The Definition of Done ensures that completed work is genuinely complete, reviewed, validated, documented, and ready for the next step.

**Core Principle:**
> If it cannot be verified, it is not done.

This applies to:
- Documents
- Designs
- Code
- Tests
- Migrations
- Reviews
- Releases

---

## 2. General Definition of Done

A deliverable is considered done only when all applicable items below are complete.

### 2.1 Universal Criteria

- [ ] Requirement is clear
- [ ] Scope is approved
- [ ] Relevant design is completed
- [ ] Relevant architecture is approved
- [ ] Implementation is completed if applicable
- [ ] Tests are written and passing if applicable
- [ ] Security review completed if applicable
- [ ] Performance review completed if applicable
- [ ] UI/UX review completed if applicable
- [ ] Documentation updated
- [ ] Approval recorded
- [ ] No unresolved high or critical findings

### 2.2 Evidence Requirement

Every done item must have evidence such as:
- Review notes
- Test results
- Validation output
- Approval record
- Git diff
- Screenshot
- Execution log

---

## 3. Document Definition of Done

A document is done when:
- [ ] Purpose is clear
- [ ] Scope is complete
- [ ] Terminology matches PROJECT_KNOWLEDGE.md
- [ ] No conflicts with existing approved documents
- [ ] Review feedback resolved
- [ ] Final approval recorded
- [ ] Revision history updated

**Document-specific evidence:**
- Content review completed
- Consistency check passed
- Approval sign-off present

---

## 4. Feature Definition of Done

A feature is done when:
- [ ] Feature matches approved requirement
- [ ] Design is implemented as approved
- [ ] All relevant tests pass
- [ ] Security impact reviewed
- [ ] Performance impact reviewed
- [ ] UI/UX approved if user-facing
- [ ] API contract satisfied
- [ ] Database migrations verified if required
- [ ] Monitoring/logging considered
- [ ] Documentation updated
- [ ] No regression introduced

### 4.1 Feature-Specific Examples

#### Exam Submission Feature
- [ ] Student can submit answers
- [ ] Server enforces deadline
- [ ] Score calculated server-side
- [ ] Results stored correctly
- [ ] Auto-save works
- [ ] Cross-tenant access blocked

#### Result Release Feature
- [ ] Result marked released
- [ ] WhatsApp jobs queued
- [ ] Result storage not blocked by notifications
- [ ] Notification logs created
- [ ] Retry and fallback rules enforced

#### Mode 2 Exam Feature
- [ ] Only OMR grid displayed
- [ ] No question content sent to client
- [ ] Timer visible and enforced server-side
- [ ] Student can complete answers on mobile

---

## 5. Code Definition of Done

Code is done when:
- [ ] Code follows approved coding standards
- [ ] Code is reviewed
- [ ] Unit tests pass
- [ ] Integration tests pass if relevant
- [ ] Security and performance checks pass if relevant
- [ ] No console errors or obvious warnings remain
- [ ] No dead code added
- [ ] No unrelated formatting-only noise introduced

---

## 6. Test Definition of Done

Tests are done when:
- [ ] Test intent is clear
- [ ] Tests are deterministic
- [ ] Tests are isolated
- [ ] Coverage target met for affected area
- [ ] Critical paths covered
- [ ] Mocks are used appropriately
- [ ] Test failures are actionable

---

## 7. Review Definition of Done

A review is done when:
- [ ] Findings are categorized by severity
- [ ] Recommendations are clear
- [ ] Critical/high findings resolved or formally accepted
- [ ] Review output is recorded
- [ ] Sign-off captured

---

## 8. Migration / Change Definition of Done

A migration or system change is done when:
- [ ] Migration plan completed
- [ ] Migration executed successfully
- [ ] Validation performed
- [ ] Rollback path considered
- [ ] Monitoring in place
- [ ] No data loss or corruption
- [ ] Documentation updated

---

## 9. Release Definition of Done

A release is done when:
- [ ] All required features are complete
- [ ] Critical tests pass
- [ ] Security review is passing
- [ ] Performance review is acceptable
- [ ] UI/UX review is passing for user-facing changes
- [ ] Release notes prepared
- [ ] Approval obtained
- [ ] Deployment verified

---

## 10. Not Done If...

Work is not done if any of the following remain:
- Missing approval
- Missing validation
- Missing tests
- Missing review
- Unresolved critical bug
- Unresolved security issue
- Unresolved performance issue
- Documentation mismatch
- Ambiguous behavior

---

## 11. Done Checklist Template

```markdown
## Definition of Done Checklist: [Item]

### Requirement
- [ ] Requirement approved
- [ ] Scope complete

### Design & Architecture
- [ ] Design approved
- [ ] Architecture approved

### Implementation
- [ ] Code complete
- [ ] Tests passing
- [ ] Reviews completed

### Validation
- [ ] Security validation complete
- [ ] Performance validation complete
- [ ] UI/UX validation complete (if relevant)

### Documentation
- [ ] Docs updated
- [ ] Revision history updated
- [ ] Approval recorded

### Result
**Status:** DONE / NOT DONE
```

---

## 12. Definition of Done Sign-Off

This document defines the minimum completion criteria for EduOMR.

**Nothing is done unless it can be proven done.**

---

## Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-13 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved after review — DoD criteria validated across all deliverable types |

---

## Approval Sign-Off

**Document:** DOC 0.15 — Definition of Done  
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Delivery Lead | opencode | 2026-07-14 | ✅ Approved |

---

**Next:** After approval, proceed to DOC 0.16 — Project Memory
