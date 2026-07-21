# DOC 1.1 — Vision Document

**Document ID:** 1.1
**Title:** Vision Document — EduOMR Product Vision
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Founder
**Date:** 2026-07-14
**Purpose:** Define the high-level vision, market opportunity, target customers, core value proposition, and strategic direction for EduOMR.

---

## 1. Executive Summary

EduOMR is an enterprise-grade, multi-tenant SaaS platform purpose-built to digitize the entire examination lifecycle for educational institutions. Starting with an OMR-based examination system, EduOMR eliminates the need for physical OMR sheets, scanners, and manual evaluation while preserving the familiar OMR interaction model that students and teachers already understand.

The platform serves two distinct but equally critical exam modes — digital question paper with digital OMR (Mode 1) and physical question paper with digital OMR (Mode 2) — ensuring full coverage for institutions at any stage of digital adoption.

Built on a modern stack (Node.js, PostgreSQL, Redis, React), EduOMR is designed from day one for multi-tenancy, subscription billing, AI-assisted workflows, and horizontal scale to serve thousands of institutions and millions of users.

---

## 2. Product Vision Statement

> To become the operating system for examination management across every educational institution in India and emerging markets — making exams paperless, instant, and insight-rich.

---

## 3. Market Opportunity

### 3.1 The Problem

- **Physical OMR is expensive and slow:** Institutions spend lakhs per exam cycle on OMR sheets, scanners, and manual verification. Results take days or weeks.
- **Digital tools are fragmented:** Schools use different tools for question creation, scheduling, grading, and result publishing. No single platform owns the end-to-end workflow.
- **Internet reliability varies:** Many institutions cannot assume stable internet during exams. Mode 2 (physical paper + digital OMR) directly solves this.
- **Parent communication is manual:** Schools rely on SMS, phone calls, or printed report cards to share results. WhatsApp-based instant notification is absent.
- **No multi-tenant platform exists for Indian education:** Most ed-tech tools are single-institution or built for developed markets.

### 3.2 Market Size

- **India:** 1.5M+ schools, 50,000+ colleges, 30,000+ coaching institutes, 250M+ students enrolled.
- **Total Addressable Market:** Exam management software for Indian educational institutions — estimated at ₹5,000+ crore annually.
- **Serviceable Addressable Market:** Private schools, coaching institutes, and colleges with per-student exam budgets of ₹200-₹500 per year.
- **Target Year 1:** 100 institutions, 50,000 students, ₹1 crore ARR.

### 3.3 Key Trends

- NEP 2020 mandates competency-based assessment and digital readiness.
- WhatsApp penetration in Indian parents exceeds 95%.
- Post-COVID digital adoption in schools is accelerating.
- Cloud infrastructure costs are decreasing.
- AI-assisted grading and insights are becoming expected.

---

## 4. Target Customer Segments

### 4.1 Primary Segments (MVP)

| Segment | Description | Size | Urgency |
|---|---|---|---|
| Private K-12 Schools | CBSE/ICSE/state-board schools with 500-5,000 students | High | High — regular exam cycles |
| Coaching Institutes | JEE/NEET/competitive exam coaching with 200-10,000 students | High | Very High — weekly tests |
| Undergraduate Colleges | Affiliated colleges with 1,000-10,000 students | Medium | Medium — semester exams |
| Universities | Multi-department universities with 5,000-50,000 students | Low | Low — complex decision-making |

### 4.2 Secondary Segments (Post-MVP)

- Corporate training departments
- Certification bodies
- Government examination boards
- International schools in SAARC and ASEAN markets
- Ed-tech platforms seeking embedded assessment

### 4.3 Users Within Each Institution

| Role | Count per Institution | Needs |
|---|---|---|
| Institution Admin | 1-5 | Configuration, billing, user management, reports |
| Teacher | 10-500 | Exam creation, question banking, answer keys, result release |
| Student | 200-50,000 | Take exams, view results, review performance |
| Parent | 200-50,000 | Receive results, track progress (via WhatsApp) |
| Super Admin (EduOMR) | 1-5 (global) | Platform management, institution oversight, billing verification |

---

## 5. Core Value Proposition

### 5.1 For Institutions

- **Zero hardware cost:** No OMR scanners, no special printers, no dedicated servers.
- **Same-day results:** Auto-scoring on submission eliminates the 3-7 day wait.
- **Both exam modes:** Use Mode 1 (fully digital) or Mode 2 (physical paper + digital OMR) based on infrastructure.
- **Tenant-isolated:** Every institution's data is secured and isolated by design.
- **Pay-as-you-grow:** Subscription-based pricing with no upfront Capex.

### 5.2 For Teachers

- **Create exams in minutes:** Question bank, bulk upload, answer key management.
- **Real-time monitoring:** Live dashboard during exams shows submission status.
- **One-click result release:** Scores calculated automatically, notifications dispatched.
- **Per-question analytics:** Understand which questions were easy or hard for students.

### 5.3 For Students

- **Familiar OMR interface:** No learning curve — click bubbles just like filling a physical sheet.
- **Auto-save:** Answers are saved every 30 seconds. No loss on network issues.
- **Instant results:** View score, percentage, rank, and per-question breakdown immediately on release.
- **Accessible on any device:** Phone, tablet, laptop — any browser.

### 5.4 For Parents

- **Instant WhatsApp notification:** Result delivered to parent's WhatsApp within seconds of release.
- **Track progress:** Compare scores across exams over time.

---

## 6. Key Differentiators

| Differentiator | EduOMR | Competitors |
|---|---|---|
| Multi-tenant SaaS | Built from day one | Mostly single-tenant or on-prem |
| Dual exam modes | Digital + Physical Paper | Most support one mode only |
| WhatsApp-native notifications | Meta Cloud API, instant, reliable | Email/SMS only |
| Auto-score on submission | Immediate, server-side, no client computation | Batched or delayed |
| No hardware dependency | Browser-only | Scanners, special printers, dedicated machines |
| Indian market focus | Pricing, language, board compatibility | Built for Western markets |
| AI-assisted workflows | Architecture ready for AI grading, insights | Mostly manual tools |
| Subscription with manual payment | Paytm QR + UTR verification | International payment gateways only |

---

## 7. Strategic Goals

### 7.1 Year 1 (MVP Launch)

- **Product:** Ship MVP with both exam modes, auto-scoring, WhatsApp notifications, and multi-tenant administration.
- **Adoption:** Onboard 100 institutions across India.
- **Revenue:** Achieve ₹1 crore ARR.
- **Team:** Build core engineering team of 5-8 engineers.
- **Infrastructure:** Single-region deployment with horizontal scaling capability.

### 7.2 Year 2 (Growth)

- **Product:** AI-assisted question generation, plagiarism detection, advanced analytics, parent dashboard.
- **Adoption:** Onboard 500 institutions.
- **Revenue:** Achieve ₹5 crore ARR.
- **Team:** Scale to 15-20 engineers, add sales and support.
- **Infrastructure:** Multi-region active-passive deployment.

### 7.3 Year 3 (Scale)

- **Product:** Full LMS integration, marketplace for test series, white-label options for large institutions.
- **Adoption:** Onboard 2,000+ institutions.
- **Revenue:** Achieve ₹20 crore ARR.
- **Team:** Scale to 40+ across engineering, product, sales, support.
- **Infrastructure:** Multi-region active-active, SOC 2 compliance.

---

## 8. Product Principles

1. **Exam integrity above all.** Answer keys never reach the client. Scores never compute on the client. Timer is server-enforced.
2. **Multi-tenancy is not optional.** Every query includes tenant_id. Every data access is tenant-scoped.
3. **Notifications never block.** WhatsApp is always async. Result storage and notification are fully decoupled.
4. **Both modes ship in v1.0.** Neither mode is deferred. Both are MVP-critical.
5. **Security by design.** All input is validated. All secrets are env-based. All access is authorized.
6. **Simplicity over configurability.** Ship opinionated workflows that work. Add knobs only when data proves they're needed.
7. **Mobile-first, desktop-rich.** Students take exams on phones. Teachers manage on desktops. Both experiences are first-class.
8. **Build for India first.** Pricing, timing, curriculum, payment, and communication channels are optimized for the Indian education market.

---

## 9. Success Metrics

### 9.1 Product Metrics

- Exam completion rate: >90%
- Auto-score accuracy: 100% (deterministic by design)
- WhatsApp delivery rate: >95% within 5 minutes of release
- Platform uptime: 99.9% during exam hours
- Answer auto-save reliability: Zero data loss on network interruptions

### 9.2 Business Metrics

- Monthly Active Institutions (MAI)
- Monthly Active Students (MAS)
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Net Revenue Retention (NRR)
- Time to value (institution setup to first exam live)

### 9.3 Quality Metrics

- Test coverage: >80%
- Critical/security bugs: Zero in production
- P99 API response time: <500ms
- P99 page load time: <2s

---

## 10. Competitive Landscape

### 10.1 Direct Competitors

| Competitor | Strengths | Weaknesses |
|---|---|---|
| **ThinkExam** | Established brand, offline-capable | Single-tenant, outdated UI, no WhatsApp |
| **Examly** | Good question bank, AI features | No Mode 2, expensive, US-focused |
| **Mettl** | Proctoring, enterprise-grade | Overkill for schools, very expensive |
| **Google Forms + Apps Script** | Free, familiar | No OMR, no auto-score, no WhatsApp, no multi-tenancy |
| **OpenEMR / custom ERP** | Free/open-source | Requires technical team, no support, no dual mode |

### 10.2 EduOMR Positioning

EduOMR positions itself as the **affordable, modern, India-first** alternative that covers both digital and physical exam scenarios on a single platform — something no competitor does today.

---

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Low internet penetration in target institutions | High | Mode 2 ensures functionality without internet; auto-save protects against drops |
| Teacher resistance to digital exams | Medium | OMR interaction model is familiar; one-click result release saves hours |
| Competitor adds Mode 2 | Medium | First-mover advantage in this specific combination; focus on execution speed |
| WhatsApp API rate limits or policy changes | Medium | Decoupled architecture; email fallback; provider-agnostic notification interface |
| Subscription payment collection | Medium | Manual verification with UTR is MVP pragmatism; payment gateway integration in post-MVP |
| Scaling costs as user base grows | Low | Pay-as-you-grow cloud infra; efficient query patterns; caching strategy |

---

## 12. Strategic Roadmap Summary

| Phase | Focus | Timeline |
|---|---|---|
| Phase 0 — AI Engineering Framework | Setup all AI protocols and governance | Complete |
| Phase 1 — Requirements | Vision, PRD, SRS, Scope, Roadmap, Risk analysis | Current |
| Phase 2 — Architecture | HLD, LLD, Database, API, Security, Deployment | Next |
| Phase 3 — Implementation | Foundation → Auth → Institutions → Users → Academics → Exams → Notifications → Frontend | After Phase 2 |
| Phase 4 — Launch | Beta, feedback, GA launch, 100-institution onboarding | End of Year 1 |
| Phase 5 — Growth | AI features, analytics, marketplace, scale | Year 2+ |

---

## 13. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 14. Approval Sign-Off

**Document:** DOC 1.1 — Vision Document
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Product Lead | opencode | 2026-07-14 | ✅ Approved |
