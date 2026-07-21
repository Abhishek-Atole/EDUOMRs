# DOC 1.7 — Roadmap

**Document ID:** 1.7
**Title:** Roadmap — EduOMR Product Roadmap & Milestones
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Product + Engineering
**Date:** 2026-07-14
**Purpose:** Define the phased product roadmap with milestones, timelines, and deliverables for EduOMR from MVP through Year 3.

---

## 1. Roadmap Overview

```
Phase 0 (Jul 2026)    Phase 1 (Jul 2026)     Phase 2 (Aug 2026)       Phase 3 (Aug-Dec 2026)
────────────────      ────────────────       ────────────────         ─────────────────────
AI Engineering        Requirements Docs      Architecture Docs        Implementation
Framework (16 docs)   (11 docs)              (8 docs)                 (Foundation → Frontend)

           ██    ████████    ████████████████████    ████████████████████████████████

Phase 4 (Jan-Mar 2027)    Phase 5 (Apr-Dec 2027)     Phase 6 (2028+)
────────────────────      ────────────────────       ────────────────
Beta → GA Launch          Growth Features             Scale & Ecosystem
```

---

## 2. Phase Breakdown

### Phase 0 — AI Engineering Framework (Jul 2026)
**Status:** ✅ Complete

| Milestone | Date | Deliverables |
|---|---|---|
| AI Framework Completion | Jul 14 | 16 approved documents |

### Phase 1 — Requirements (Jul 2026)
**Status:** 🔄 In Progress

| Milestone | Date | Deliverables |
|---|---|---|
| Vision, PRD, TRD, SRS, BRD | Jul 14 | 5 approved docs |
| Scope, Roadmap, Risk Analysis | Jul 14 | 3 docs |
| Feasibility Study, User Stories, Use Cases | Jul 14 | 3 docs |

### Phase 2 — Architecture (Jul-Aug 2026)
**Status:** ⏳ Pending

| Milestone | Estimate | Deliverables |
|---|---|---|
| HLD | 2 days | High-level design document |
| LLD | 3 days | Low-level design with module specs |
| Database Design | 2 days | Complete schema with indexes |
| API Design | 2 days | Full API contract specification |
| Security Architecture | 1 day | Security design + threat model |
| Deployment Architecture | 1 day | Infrastructure + CI/CD design |
| Testing Strategy | 1 day | Test plan, coverage targets |
| DevOps Plan | 1 day | Pipeline, monitoring, alerting |

### Phase 3 — Implementation (Aug-Dec 2026)

#### Sprint A: Foundation (2 weeks)
| Week | Deliverables |
|---|---|
| 1 | Project scaffold, environment config, Express middleware stack |
| 2 | PostgreSQL + Prisma schema, Redis client, Winston logger |

#### Sprint B: Authentication (2 weeks)
| Week | Deliverables |
|---|---|
| 3 | User + Institution schema, Institution registration |
| 4 | Login, refresh, logout, RBAC middleware, tenant middleware |

#### Sprint C: Institution + Subscription (2 weeks)
| Week | Deliverables |
|---|---|
| 5 | Institution CRUD, Subscription plans |
| 6 | Payment upload, Super Admin verification, Subscription guard |

#### Sprint D: User Management (2 weeks)
| Week | Deliverables |
|---|---|
| 7 | Teacher CRUD, Student CRUD, bulk upload |
| 8 | Parent CRUD + student link, Profile management |

#### Sprint E: Academic Structure (1 week)
| Week | Deliverables |
|---|---|
| 9 | Academic Year, Class, Section, Subject, Enrollment CRUD |

#### Sprint F: Exam Module — Backend (3 weeks)
| Week | Deliverables |
|---|---|
| 10 | Exam CRUD, Question CRUD, bulk upload |
| 11 | Answer key upload, Exam publish, Exam session API |
| 12 | Auto-save, Timer enforcement, Submit, Auto-submit |

#### Sprint G: Auto Score + Results (2 weeks)
| Week | Deliverables |
|---|---|
| 13 | Score calculation engine, Evaluation worker |
| 14 | Result release, Result views, Rank calculation |

#### Sprint H: Notifications (1 week)
| Week | Deliverables |
|---|---|
| 15 | Bull queue setup, WhatsApp client, Notification worker |

#### Sprint I: Frontend — Foundation (2 weeks)
| Week | Deliverables |
|---|---|
| 16 | Vite + React + Tailwind + shadcn/ui, Auth pages, Role-based routing |
| 17 | Admin dashboard, Teacher dashboard |

#### Sprint J: Frontend — Exam UI (3 weeks)
| Week | Deliverables |
|---|---|
| 18 | Exam creation form, Question editor |
| 19 | OmrSheet component, ExamTimer hook, Auto-save hook |
| 20 | Mode 1 page, Mode 2 page, Result view |

### Phase 4 — Beta & Launch (Jan-Mar 2027)

| Milestone | Date |
|---|---|
| Internal alpha | Jan 1-15 |
| Beta with 10 institutions | Jan 16-Feb 15 |
| Bug fixes + stabilization | Feb 16-Mar 15 |
| GA launch | Mar 15 |
| Target: 50 institutions | Mar 31 |

### Phase 5 — Growth Features (Apr-Dec 2027)

| Quarter | Features |
|---|---|
| Q2 2027 | Payment gateway integration, bulk result download, leaderboard, scheduled exam publish |
| Q3 2027 | AI question generation, enhanced question bank, multi-language support |
| Q4 2027 | Detailed analytics, role expansion, student re-attempts |

### Phase 6 — Scale & Ecosystem (2028+)

| Focus | Features |
|---|---|
| Scale | Multi-region deployment, performance optimization at 2,000+ institutions |
| Ecosystem | API marketplace, LMS integrations, white-label |
| AI | Plagiarism detection, AI grading assistants, predictive analytics |

---

## 3. Key Milestones

| Milestone | Date | Verification |
|---|---|---|
| Phase 0 complete | Jul 14, 2026 | ✅ Done |
| Phase 1 complete | Jul 14, 2026 | 🔄 Current |
| Phase 2 complete | Aug 1, 2026 | |
| Backend API ready | Oct 15, 2026 | All API endpoints passing integration tests |
| Frontend exam UI ready | Nov 15, 2026 | Both modes working in all target browsers |
| End-to-end integration complete | Dec 1, 2026 | Full exam flow working (create → take → score → release → notify) |
| Internal alpha | Jan 1, 2027 | Staff + family can create and take exams |
| Beta launch | Jan 16, 2027 | 10 institutions actively using the platform |
| GA launch | Mar 15, 2027 | Public availability, paid subscriptions |
| 100 institutions | Jul 2027 | Year 1 target met |

---

## 4. Dependencies & Critical Path

### Critical Path

```
Requirements → Architecture → Implementation Begins
                                   ↓
                    Foundation → Auth → Institution → Users
                                   ↓
                    Academics → Exams → Score → Notifications
                                   ↓
                    Frontend Foundation → Exam UI → Integration → Beta
```

### Key Dependencies

| Dependency | Blocks | Mitigation |
|---|---|---|
| Requirements docs complete | Architecture phase | Complete by Jul 14 |
| Architecture docs complete | Implementation start | Complete by Aug 1 |
| Prisma schema finalized | All backend work | Frozen by Sprint A end |
| Meta WhatsApp API approved | Notification module | Start approval process in Phase 2 |
| Frontend exam UI mode mockups | Exam UI implementation | Mockups in Phase 2; finalize before Sprint J |

---

## 5. Resource Plan

| Role | Aug-Dec (Build) | Jan-Mar (Beta/Launch) |
|---|---|---|
| Backend Engineers | 3 | 3 |
| Frontend Engineers | 2 | 2 |
| QA Engineer | 1 | 1 |
| DevOps / Infrastructure | 1 (shared) | 1 |
| Product Manager | 1 | 1 |
| Designer | 1 (part-time) | 1 (part-time) |
| Support / Ops | 0 | 1 |
| **Total** | **9** | **10** |

---

## 6. Risk-Adjusted Timeline

| Risk | Adjustment | Buffer Days |
|---|---|---|
| Meta API approval delayed | Start in Sprint G, buffer in Sprint H | 5 |
| UI complexity underestimated | Buffer in Sprint I + J | 5 |
| Third-party integration issues | Buffer at end of Phase 3 | 10 |
| Team availability changes | Built into sprint planning | Per sprint (1 day buffer per 2-week sprint) |
| Requirement changes mid-implementation | Scope change process | Depends on change impact |
| **Total buffer** | | **20 days (~1 month)** |

---

## 7. Versioning & Release Strategy

### 7.1 Version Scheme

```
v{major}.{minor}.{patch}
- Major: Breaking changes, significant milestones
- Minor: Features, non-breaking improvements
- Patch: Bug fixes, security patches, hotfixes
```

### 7.2 Planned Releases

| Release | Version | Date | Contents |
|---|---|---|---|
| Alpha | v0.1.0 | Jan 1, 2027 | All backend + frontend P0 features, internal testing |
| Beta | v0.9.0 | Jan 16, 2027 | Beta-ready with all P0 features, bug fixes |
| GA | v1.0.0 | Mar 15, 2027 | Production-ready, stable, documented |
| Post-GA 1 | v1.1.0 | Jun 2027 | Payment gateway, leaderboard, scheduled publish |
| Post-GA 2 | v1.2.0 | Sep 2027 | AI question generation, multi-language |
| Post-GA 3 | v1.3.0 | Dec 2027 | Analytics, role expansion |

### 7.3 Release Cadence
- Patch releases: As needed (hotfix within 24 hours)
- Minor releases: Every quarter
- Major releases: Annual

---

## 8. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 9. Approval Sign-Off

**Document:** DOC 1.7 — Roadmap
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Product Lead | opencode | 2026-07-14 | ✅ Approved |
