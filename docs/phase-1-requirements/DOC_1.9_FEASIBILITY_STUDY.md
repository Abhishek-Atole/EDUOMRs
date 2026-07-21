# DOC 1.9 — Feasibility Study

**Document ID:** 1.9
**Title:** Feasibility Study — Technical, Operational, Financial & Schedule Feasibility
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Engineering + Business
**Date:** 2026-07-14
**Purpose:** Assess the technical, operational, financial, and schedule feasibility of the EduOMR MVP.

---

## 1. Feasibility Dimensions

This study evaluates feasibility across four dimensions:

| Dimension | Focus | Assessment |
|---|---|---|
| Technical | Can we build it with the chosen stack? | ✅ |
| Operational | Can we run it reliably? | ✅ |
| Financial | Can we afford to build and operate it? | ✅ |
| Schedule | Can we deliver it within the timeline? | ✅ |

---

## 2. Technical Feasibility

### 2.1 Stack Assessment

| Component | Feasibility | Rationale |
|---|---|---|
| **Express.js + Node.js** | ✅ High | Mature framework; handles async I/O well for concurrent exam sessions; large ecosystem; team experience available |
| **PostgreSQL + Prisma** | ✅ High | ACID compliance essential for exam data integrity; Prisma type-safety reduces query bugs; migration tooling is mature |
| **Redis** | ✅ High | Sub-millisecond cache reads; Bull queue persistence; widely used in production at scale |
| **React + Vite + Tailwind** | ✅ High | Modern, fast tooling; shadcn/ui provides accessible components; Tailwind enables rapid UI development |
| **Meta WhatsApp Cloud API** | ✅ Medium | Official, well-documented API; requires business account approval (2-5 days); template approval process; rate limits manageable for MVP scale |
| **Puppeteer** | ✅ Medium | Headless Chrome for PDF generation; memory-intensive; needs isolation from request path; proven in production at many companies |
| **JWT Auth** | ✅ High | Stateless, no session store; widely understood; refresh token rotation pattern is well-documented |
| **Bull Queue** | ✅ High | Redis-backed, reliable; retry, delay, job events; dead-letter support; battle-tested at scale |

### 2.2 Architecture Feasibility

| Requirement | Feasibility | Approach |
|---|---|---|
| Multi-tenancy (data isolation) | ✅ High | tenant_id column on all tenant-scoped tables; Prisma `where` filter at repository layer; JWT-based extraction |
| Auto-save (30 second interval) | ✅ High | Upsert pattern on student_answers table; client-side queue for offline resilience |
| Server-enforced timer | ✅ High | Check on every save/submit: `NOW() <= started_at + duration`; server clock is source of truth |
| Auto-submit at deadline | ✅ High | Bull scheduled job at deadline time; batch process all in-progress sessions |
| WhatsApp notification queue | ✅ High | Bull job per parent; retry + email fallback; logging at every step |
| Both exam modes | ✅ High | Mode 1 returns questions + grid; Mode 2 returns grid only — enforced at API level, not UI level |
| Score calculation (never on client) | ✅ High | Triggered on server after submission; client receives only the final result (after release) |

### 2.3 Technical Challenges

| Challenge | Difficulty | How We Address It |
|---|---|---|
| Race condition on auto-save | Medium | Upsert is atomic in PostgreSQL; client sends all answers each save; server deduplicates by question_id |
| Timer accuracy under server load | Low | Server clock is authoritative; 1-second precision is sufficient for exam timing |
| WhatsApp rate limits | Medium | Queue-based throttling; email fallback; Meta allows 250 messages/24h per phone number (sufficient for MVP) |
| PDF generation memory usage | Medium | Puppeteer runs in isolated worker; max 2 concurrent PDF jobs; 1GB memory limit per worker |
| Concurrent DB writes during exam | Medium | Connection pooling (Prisma); batch answer persistence; Redis write-through for cache |

### 2.4 Technical Feasibility Verdict

**✅ FEASIBLE.** All technology choices are proven, well-documented, and appropriate for the MVP scale. The two medium-risk areas (WhatsApp API and Puppeteer) have clear mitigation strategies.

---

## 3. Operational Feasibility

### 3.1 Hosting & Infrastructure

| Requirement | Feasibility | Approach |
|---|---|---|
| Cloud hosting | ✅ High | AWS/GCP/Azure — any works; MVP can run on ₹5,000-₹10,000/month per app server |
| Database management | ✅ High | Managed PostgreSQL (AWS RDS, GCP Cloud SQL, or self-hosted); automated backups; monitoring |
| CI/CD pipeline | ✅ High | GitHub Actions or GitLab CI; automated testing + deployment |
| Monitoring | ✅ High | Application logging (Winston); health endpoint; DB monitoring (pg_stat_activity); queue monitoring (Bull Board) |

### 3.2 Team Requirements

| Role | Required | Availability | Feasibility |
|---|---|---|---|
| Backend Engineer (Node.js/Express/PostgreSQL) | 3 | Contract/freelance market has strong supply | ✅ |
| Frontend Engineer (React/Tailwind) | 2 | Strong supply in Indian market | ✅ |
| QA Engineer | 1 | Available | ✅ |
| DevOps / Infrastructure | 1 (shared) | Available | ✅ |
| Product Manager | 1 | Founder | ✅ |

### 3.3 Support Requirements (Post-Launch)

| Area | Requirement | Feasibility |
|---|---|---|
| Institution onboarding | 30-60 min per institution via screen share | ✅ (one person can onboard 10+ per week) |
| Technical support | WhatsApp group + email | ✅ |
| Incident response | On-call rotation among engineers | ✅ (weekday business hours for MVP; 24/7 for critical incidents) |

### 3.4 Operational Feasibility Verdict

**✅ FEASIBLE.** A team of 5-8 engineers can build the MVP. Operational support for 100 institutions is achievable with 1-2 support personnel post-launch.

---

## 4. Financial Feasibility

### 4.1 Development Cost Estimate

| Item | Monthly Cost | Duration | Total |
|---|---|---|---|
| Backend Engineer (3) | ₹1,50,000 × 3 | 5 months | ₹22,50,000 |
| Frontend Engineer (2) | ₹1,20,000 × 2 | 5 months | ₹12,00,000 |
| QA Engineer (1) | ₹80,000 × 1 | 5 months | ₹4,00,000 |
| DevOps (1 shared) | ₹50,000 × 1 | 5 months | ₹2,50,000 |
| Cloud infrastructure | ₹50,000/month | 8 months (build + launch) | ₹4,00,000 |
| Tools & services | ₹20,000/month | 8 months | ₹1,60,000 |
| **Total Development Cost** | | | **₹46,60,000** |

### 4.2 Monthly Operating Cost (Post-Launch)

| Item | Cost |
|---|---|
| Cloud infrastructure (2 app servers + DB + Redis) | ₹25,000 |
| Managed PostgreSQL | ₹10,000 |
| Managed Redis | ₹5,000 |
| WhatsApp API usage | ₹5,000 (estimate) |
| SendGrid email | ₹2,000 |
| Monitoring & tools | ₹3,000 |
| **Total Monthly OpEx** | **₹50,000** |

### 4.3 Revenue vs Cost Projection

| Month | Institutions | MRR | OpEx | Gross Margin |
|---|---|---|---|---|
| Month 1 (Beta) | 0 | ₹0 | ₹50,000 | -₹50,000 |
| Month 2 (GA Launch) | 10 | ₹40,000 | ₹50,000 | -₹10,000 |
| Month 3 | 25 | ₹1,00,000 | ₹50,000 | ₹50,000 |
| Month 6 | 50 | ₹2,00,000 | ₹60,000 | ₹1,40,000 |
| Month 12 | 100 | ₹4,00,000 | ₹75,000 | ₹3,25,000 |

**Break-even:** Month 3 post-GA (assuming 25 paid institutions)

### 4.4 Financial Feasibility Verdict

**✅ FEASIBLE.** Total development cost of ~₹47L is reasonable for an MVP of this scope. Break-even at 25 institutions (3 months post-launch) is achievable. Monthly OpEx of ₹50,000-₹75,000 is sustainable at target pricing.

---

## 5. Schedule Feasibility

### 5.1 Timeline Assessment

| Phase | Duration | Start | End | Feasibility |
|---|---|---|---|---|
| Phase 0 (AI Framework) | 2 weeks | Jul 1 | Jul 14 | ✅ Complete |
| Phase 1 (Requirements) | 1 week | Jul 14 | Jul 14 | ✅ On track |
| Phase 2 (Architecture) | 2 weeks | Jul 15 | Jul 31 | ✅ Achievable |
| Phase 3 (Implementation) | 20 weeks (5 months) | Aug 1 | Dec 15 | ✅ Achievable with team |
| Phase 4 (Beta + Launch) | 12 weeks | Jan 1 | Mar 31 | ✅ Achievable |

### 5.2 Critical Path Analysis

The critical path for the MVP is:

```
Requirements → Architecture → Foundation → Auth → Institution → Users → 
Academics → Exams (backend) → Score → Notifications → Frontend → Integration → Beta
```

**Total critical path:** 24 weeks from Phase 2 start to Beta ready.

### 5.3 Buffer Analysis

| Buffer Type | Days | Usage |
|---|---|---|
| Sprint buffer (1 day per 2-week sprint) | 10 | Schedule slips, task estimation errors |
| Integration buffer | 5 | E2E testing and bug fixing |
| Beta preparation buffer | 5 | Deployment, documentation, onboarding setup |
| **Total buffer** | **20** | **~1 month** |

### 5.4 Reasonable Timeline (With Risk)

- **Best case:** GA by Mar 1, 2027 (no major blockers)
- **Expected case:** GA by Mar 15, 2027 (minor delays absorbed by buffer)
- **Worst case:** GA by Apr 15, 2027 (major issues requiring contingency buffer)

### 5.5 Schedule Feasibility Verdict

**✅ FEASIBLE.** A 5-month implementation timeline for a team of 5-8 engineers is aggressive but achievable. The scope is well-defined, the stack is standard, and 20 days of buffer provide realistic contingency.

---

## 6. Feasibility Summary

| Dimension | Verdict | Confidence | Key Risk |
|---|---|---|---|
| **Technical** | ✅ Feasible | High | Meta WhatsApp API approval timing |
| **Operational** | ✅ Feasible | High | Team continuity during build |
| **Financial** | ✅ Feasible | Medium | Revenue timing — need 25+ institutions by Month 3 |
| **Schedule** | ✅ Feasible | Medium | Scope creep or team churn could delay |

**Overall Verdict: ✅ FEASIBLE with medium confidence.**

---

## 7. Go/No-Go Criteria

### 7.1 Go Criteria (All must be met)

- [ ] Requirements documents (Phase 1) approved
- [ ] Architecture documents (Phase 2) approved
- [ ] Team of 5+ engineers committed
- [ ] Development budget of ₹47L secured
- [ ] Meta WhatsApp Business Account approved
- [ ] Cloud infrastructure account provisioned

### 7.2 No-Go Criteria (Any triggers pause)

- Development budget not secured
- Unable to hire 3+ backend engineers
- Meta WhatsApp API approval denied
- Scope expands beyond P0 without timeline adjustment

---

## 8. Recommendations

1. **Proceed with MVP development** — All four feasibility dimensions are positive
2. **Start WhatsApp approval process immediately** (during Phase 2) — this is the longest-lead external dependency
3. **Begin hiring in Phase 2** so team is ready for Phase 3 start
4. **Lock scope at Phase 2 completion** — no P1 features during MVP build
5. **Secure 6 months of runway** before GA launch to cover development + initial operating costs

---

## 9. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 10. Approval Sign-Off

**Document:** DOC 1.9 — Feasibility Study
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-14 | ✅ Approved |
