# DOC 1.8 — Risk Analysis

**Document ID:** 1.8
**Title:** Risk Analysis — EduOMR Project Risk Assessment & Mitigation
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Product + Engineering
**Date:** 2026-07-14
**Purpose:** Identify, assess, and plan mitigation for all significant risks across product, technology, business, security, and operations.

---

## 1. Risk Assessment Methodology

### 1.1 Scoring Matrix

| Score | Probability | Impact |
|---|---|---|
| 1 | Very Unlikely (<5%) | Negligible |
| 2 | Unlikely (5-20%) | Minor |
| 3 | Possible (20-50%) | Moderate |
| 4 | Likely (50-80%) | Significant |
| 5 | Very Likely (>80%) | Critical |

**Risk Score = Probability × Impact**
- 1-6: Low (Accept)
- 7-12: Medium (Monitor)
- 13-19: High (Mitigate actively)
- 20-25: Critical (Requires immediate action)

---

## 2. Risk Register

### 2.1 Technology Risks

| ID | Risk | Description | P | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| TR-1 | Meta WhatsApp API approval delayed | Business account setup, template approval takes longer than expected | 3 | 4 | 12 | Start WhatsApp setup process during Phase 2; have email-only fallback ready for beta | Engineering |
| TR-2 | Auto-save data loss on network failure | Student answers lost due to race condition between client save and server persistence | 2 | 5 | 10 | Immutable event log for answers; client-side queue with retry; server deduplication | Backend |
| TR-3 | Database performance under concurrent exam load | 1,000+ concurrent sessions writing auto-save data cause DB contention | 3 | 3 | 9 | Connection pooling via Prisma; batch answer writes; Redis write-back cache; read replicas for reporting | Backend |
| TR-4 | Browser compatibility issues with OMR UI | Older browsers or specific mobile browsers have rendering issues with the OMR grid | 3 | 3 | 9 | Target modern browsers (Chrome/Firefox/Safari latest 2 versions); test on real devices during beta | Frontend |
| TR-5 | Prisma migration issues in production | Schema migration fails or causes downtime during deployment | 2 | 4 | 8 | Zero-downtime migration pattern; backward-compatible changes only; staging environment validation | Backend |
| TR-6 | Redis outage causing queue/cache failure | Bull queue or cache layer unavailable | 2 | 4 | 8 | Redis persistence enabled; queue job recovery on reconnect; cache fallback to DB read | DevOps |
| TR-7 | Puppeteer PDF generation crashes | Headless Chrome consumes too much memory or crashes under load | 3 | 3 | 9 | Isolate PDF generation in worker process; limit concurrent PDF jobs; monitor memory usage | Backend |
| TR-8 | Timer desync between server and client | Client timer drifts from server time, causing premature or delayed submission | 3 | 4 | 12 | Server-enforced deadline always authoritative; client timer synchronized periodically; server rejects late submissions | Backend |

### 2.2 Security Risks

| ID | Risk | Description | P | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| SR-1 | Cross-tenant data leak | tenant_id filter missing from a query exposes Institution B data to Institution A | 2 | 5 | 10 | Repository-layer enforcement of tenant_id; mandatory middleware injection; automated penetration testing | Backend |
| SR-2 | Answer key exposed to client | API accidentally returns answer key data to student browser | 1 | 5 | 5 | Answer key fields explicitly excluded from all student-facing responses; security review checklist; integration tests verify | Backend |
| SR-3 | JWT token theft | Access or refresh token stolen via XSS or man-in-the-middle | 2 | 4 | 8 | httpOnly + Secure + SameSite=Strict cookies for refresh token; short JWT expiry (15 min); HTTPS enforced | Backend |
| SR-4 | Brute force login attack | Automated password guessing against login endpoint | 3 | 3 | 9 | Rate limiting (5 attempts/min/IP); account lockout after 10 failed attempts; bcrypt 12 rounds | Backend |
| SR-5 | Injection attack (SQL/XSS) | Malicious input used in queries or rendered in browser | 2 | 4 | 8 | Prisma parameterized queries (safe by default); Zod input validation; React's built-in XSS protection | Full stack |
| SR-6 | Insecure file upload | Malicious file uploaded as payment screenshot | 2 | 3 | 6 | File type validation (PNG/JPG only); file size limit (5MB); virus scanning; store outside web root | Backend |

### 2.3 Business Risks

| ID | Risk | Description | P | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| BR-1 | Low adoption by institutions | Slow sales cycle, decision paralysis, or resistance to change | 3 | 5 | 15 | Focus on high-urgency segment (coaching institutes); 14-day free trial; demonstrable ROI (cost + time savings) | Sales |
| BR-2 | High churn after first month | Institutions try the platform but don't continue after trial or first paid month | 3 | 4 | 12 | Proactive onboarding support; monitor usage metrics; identify at-risk accounts and intervene early | Product |
| BR-3 | Competitor launches similar feature | Competing platform adds Mode 2 or WhatsApp notification | 3 | 3 | 9 | First-mover advantage; focus on execution speed; total experience beats individual features | Product |
| BR-4 | Price sensitivity in target market | Institutions unwilling to pay ₹2,000-₹15,000/month | 3 | 4 | 12 | Tiered pricing with low entry point; demonstrate cost savings vs. physical OMR; annual discount | Business |
| BR-5 | Payment collection friction | Manual UTR verification creates delays and frustration | 3 | 3 | 9 | Target <24 hour verification SLA; automated payment gateway as P1 priority post-MVP | Operations |
| BR-6 | Regulatory change in education tech | New government regulation impacts digital exam platforms | 1 | 4 | 4 | Build adaptable architecture; maintain NEP 2020 compliance; legal counsel advisory | Legal |

### 2.4 Operational Risks

| ID | Risk | Description | P | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| OR-1 | Production outage during exam hours | Server down, DB crash, or network issue prevents students from taking or submitting exams | 2 | 5 | 10 | 99.9% uptime target; redundant app servers; DB connection pooling; monitoring + alerting; incident response plan | DevOps |
| OR-2 | Data loss | Database corruption, accidental deletion, or migration failure causes data loss | 1 | 5 | 5 | Daily automated backups; 7-day retention; point-in-time recovery; all operations idempotent | DevOps |
| OR-3 | WhatsApp API rate limit hit | Meta rate limits prevent notification delivery during mass result release | 3 | 3 | 9 | Queue-based throttling; email fallback; staggered release for large cohorts (future) | Backend |
| OR-4 | Team member leaving during critical phase | Key engineer departs during implementation sprints | 2 | 4 | 8 | Documentation standards (code comments, READMEs); cross-training; no single-person dependencies | Engineering |
| OR-5 | Third-party API deprecation | WhatsApp, SendGrid, or other API discontinued or changed | 1 | 4 | 4 | Abstracted notification layer; provider-agnostic interfaces; monitor deprecation notices | Engineering |

### 2.5 Product Risks

| ID | Risk | Description | P | I | Score | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| PR-1 | Wrong product-market fit | Building features that institutions don't actually need | 3 | 5 | 15 | Beta with 10 institutions before GA; usage analytics; direct feedback loops; iterative development | Product |
| PR-2 | UX too complex for students | Exam interface confusing, causing errors or anxiety | 3 | 4 | 12 | Familiar OMR metaphor; user testing during beta; simplified flows; clear error messaging | Design |
| PR-3 | Scope creep delaying MVP | Additional features requested mid-development push timeline | 3 | 4 | 12 | Scope change process (Section 8 in Scope Document); strict P0 focus; trade-off conversations | Product |
| PR-4 | Mobile exam experience inadequate | Small screen makes OMR bubbles hard to tap, questions hard to read | 2 | 4 | 8 | 48x48px touch targets; stacked layout on mobile; tested on real devices during beta | Frontend |

---

## 3. Risk Heat Map

```
Probability
   5 |         |         |         |         |         |
   4 |         |         |         | BR-1    |         |
     |         |         |         | PR-1    |         |
   3 |         |         | TR-1    | TR-8    |         |
     |         |         | TR-3    | TR-4    |         |
     |         |         | SR-4    | BR-2    |         |
     |         |         | BR-4    | BR-3    |         |
     |         |         | OR-3    | PR-2    |         |
     |         |         | PR-3    | PR-3    |         |
   2 |         | TR-2    | SR-1    | SR-3    |         |
     |         | TR-5    | TR-6    | OR-1    |         |
     |         | TR-6    | SR-5    |         |         |
   1 |         | SR-6    | BR-6    | OR-5    |         |
     +---------+---------+---------+---------+---------+
       1         2         3         4         5     Impact

Legend:
  ██ Critical (15-25)   ▓▓ High (10-14)   ▒▒ Medium (7-9)   ░░ Low (1-6)
```

---

## 4. Top 10 Risks by Score

| Rank | ID | Risk | Score | Category |
|---|---|---|---|---|
| 1 | BR-1 | Low adoption by institutions | 15 | Business |
| 1 | PR-1 | Wrong product-market fit | 15 | Product |
| 3 | TR-1 | Meta WhatsApp API approval delayed | 12 | Technology |
| 3 | TR-8 | Timer desync between server and client | 12 | Technology |
| 3 | BR-2 | High churn after first month | 12 | Business |
| 3 | BR-4 | Price sensitivity | 12 | Business |
| 3 | PR-2 | UX too complex for students | 12 | Product |
| 3 | PR-3 | Scope creep delaying MVP | 12 | Product |
| 9 | SR-4 | Brute force login attack | 9 | Security |
| 9 | TR-3 | DB performance under concurrent load | 9 | Technology |

---

## 5. Critical Risk Deep-Dives

### 5.1 BR-1: Low Adoption by Institutions

**Probability:** 3 (Possible) | **Impact:** 5 (Critical) | **Score:** 15

**Root Causes:**
- Decision-makers in educational institutions are slow to adopt new technology
- Budget approval processes take months
- Lack of trust in cloud-based exam platforms

**Early Warning Signs:**
- Low demo-to-trial conversion rate (<20%)
- Trial signups but no exam created within first week
- Negative feedback during demo calls

**Mitigation Actions:**
- Target coaching institutes (fastest decision cycle) as beachhead segment
- Build case studies with early adopters showcasing time and cost savings
- Offer extended trial (30 days) for serious prospects
- Provide hands-on onboarding support (WhatsApp/Screen share)

**Contingency (If risk materializes):**
- Pivot to direct sales with on-premise option for hesitant institutions
- Partner with education department for government school pilot
- Reduce pricing temporarily to accelerate adoption

### 5.2 PR-1: Wrong Product-Market Fit

**Probability:** 3 (Possible) | **Impact:** 5 (Critical) | **Score:** 15

**Root Causes:**
- Assumptions about institution needs are incorrect
- Features built don't match actual workflows
- Competing solutions already meet the need

**Early Warning Signs:**
- Beta users request features that fundamentally differ from vision
- Low feature usage (analytics show unbuilt features)
- Beta institutions don't run second exam after first

**Mitigation Actions:**
- Beta with diverse institution types (school, coaching, college)
- Weekly feedback calls during beta
- Usage analytics from day one
- Rapid iteration during beta (2-week cycles)

**Contingency (If risk materializes):**
- Pivot feature set based on real usage data
- Remove low-usage features, double down on high-usage ones
- Consider shifting to adjacent use case if needed

---

## 6. Risk Response Plan

### 6.1 Escalation Matrix

| Risk Score | Action | Escalation To | Response Time |
|---|---|---|---|
| 20-25 (Critical) | Stop work, immediate mitigation | Founder + Engineering Lead | Within 4 hours |
| 13-19 (High) | Active mitigation plan, weekly review | Engineering Lead + Product | Within 24 hours |
| 7-12 (Medium) | Monitor, bi-weekly review | Engineering Lead | Within 1 week |
| 1-6 (Low) | Accept, document | Team leads | N/A |

### 6.2 Risk Review Cadence

| Phase | Cadence |
|---|---|
| Requirements (Phase 1) | Per document review |
| Architecture (Phase 2) | Per document review |
| Implementation (Phase 3) | Weekly at sprint review |
| Beta/Launch (Phase 4) | Daily standup + weekly risk review |

### 6.3 Risk Owner Responsibilities

1. Monitor assigned risks
2. Identify early warning signs
3. Execute mitigation actions
4. Escalate if risk materializes
5. Document risk outcome

---

## 7. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 8. Approval Sign-Off

**Document:** DOC 1.8 — Risk Analysis
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-14 | ✅ Approved |
