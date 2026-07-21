# DOC 1.5 — Business Requirements Document (BRD)

**Document ID:** 1.5
**Title:** Business Requirements Document — EduOMR Business Context & Stakeholder Needs
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Product + Business
**Date:** 2026-07-14
**Purpose:** Define the business context, stakeholder needs, revenue model, pricing strategy, and success criteria for EduOMR.

---

## 1. Business Context

### 1.1 Industry Landscape

Indian educational institutions spend an estimated ₹15,000-₹20,000 crore annually on examination administration — including printing, scanning, invigilation, evaluation, and result processing. The vast majority of this is manual, paper-based, and slow.

Key drivers for digitization:
- **NEP 2020** mandates competency-based assessment and technology adoption
- **Post-COVID digital readiness** — students, teachers, and parents are comfortable with digital tools
- **Smartphone penetration** exceeds 75% in urban India and 40% in rural India
- **WhatsApp is ubiquitous** — over 500M users in India, including parents across all socioeconomic segments
- **Cloud costs are declining** — AWS/Azure/GCP pricing has dropped 30-50% over 5 years

### 1.2 Current Pain Points

| Stakeholder | Pain Point | Business Impact |
|---|---|---|
| Institution | Physical OMR costs ₹3-₹10 per sheet × 10,000+ students = ₹30,000-₹1,00,000+ per exam | High direct cost |
| Institution | Results take 5-10 days after exam | Parent complaints, slow decision-making |
| Teacher | Manual grading 150+ papers takes 2-3 days | Low productivity, burnout |
| Teacher | No analytics — cannot identify weak topics | Poor teaching effectiveness |
| Student | No instant feedback on performance | Slower learning improvement |
| Parent | No timely result communication | Frequent calls to school, dissatisfaction |
| Institution | Multiple disconnected tools for exams, results, communication | Fragmented workflow, data silos |

### 1.3 Market Gap

No existing product combines:
1. Multi-tenant SaaS architecture (not single-institution)
2. Dual exam modes (digital + physical paper)
3. WhatsApp-native result delivery
4. Auto-scoring on submission
5. Indian-market pricing and payment methods

---

## 2. Stakeholder Analysis

### 2.1 Stakeholder Map

| Stakeholder | Influence | Interest | Priority |
|---|---|---|---|
| Platform Owner (EduOMR) | High | High | Critical |
| Super Admin (EduOMR Operations) | High | Medium | High |
| Institution Admin (School Principal/Admin) | High | High | Critical |
| Teacher | Medium | High | Critical |
| Student | Low | High | High |
| Parent | Low | Medium | High |
| Investors | High | Low | Medium |
| Competitors | Low | Low | Low |

### 2.2 Stakeholder Needs

#### Platform Owner
- Recurring revenue from subscriptions
- Platform growth (institution count, student count)
- Brand reputation and reliability
- Low churn rate
- Competitive differentiation

#### Super Admin
- Efficient institution management workflows
- Reliable payment verification process
- Platform-wide visibility into health and usage
- Ability to support institution admins

#### Institution Admin
- Affordable pricing (₹5-₹20 per student per year)
- Easy setup and onboarding
- Ability to manage teachers, students, and subscriptions
- Data security and tenant isolation
- No hardware investment required

#### Teacher
- Fast exam creation (under 15 minutes for a 50-question exam)
- Bulk question upload from existing question banks
- One-click result release
- Auto-scoring that eliminates manual grading
- Reusable question bank across exams

#### Student
- Smooth exam experience without technical issues
- Auto-save prevents answer loss
- Instant result viewing
- Works on phone or laptop
- Simple, distraction-free interface

#### Parent
- Instant result notification on WhatsApp
- Ability to view detailed breakdown
- Regular progress updates

---

## 3. Revenue Model

### 3.1 Pricing Model: Per-Institution Subscription

| Plan | Price/Month | Max Students | Features |
|---|---|---|---|
| Starter | ₹2,000 | 500 | All features, 1 admin account |
| Growth | ₹5,000 | 2,000 | All features, up to 3 admin accounts |
| Enterprise | ₹15,000 | 10,000 | All features, unlimited admins, priority support |
| Custom | Negotiable | 10,000+ | Enterprise features, SLA, dedicated support |

### 3.2 Annual Discount

- 15% discount on annual payment (12 months for price of 10)

### 3.3 Payment Model (MVP)

- Institution Admin generates payment via Paytm QR
- Uploads screenshot + UTR through the platform
- Super Admin verifies and activates subscription
- Future: Automated payment gateway (Razorpay/Stripe)

### 3.4 Revenue Projections

| Year | Institutions | Avg Plan Value | ARR |
|---|---|---|---|
| Year 1 | 100 | ₹4,000/mo | ₹48,00,000 (₹48L) |
| Year 2 | 500 | ₹5,000/mo | ₹3,00,00,000 (₹3Cr) |
| Year 3 | 2,000 | ₹6,000/mo | ₹14,40,00,000 (₹14.4Cr) |

### 3.5 Cost Structure (Estimated Monthly)

| Cost Item | Year 1 | Year 3 |
|---|---|---|
| Infrastructure (cloud) | ₹50,000 | ₹5,00,000 |
| Engineering team | ₹3,00,000 | ₹20,00,000 |
| Sales & Marketing | ₹1,00,000 | ₹5,00,000 |
| Operations & Support | ₹50,000 | ₹3,00,000 |
| WhatsApp API costs | ₹10,000 | ₹1,00,000 |
| Total | ₹5,10,000 | ₹34,00,000 |

---

## 4. Pricing Strategy Rationale

### 4.1 Pricing Principles

- **Value-based:** Price reflects the cost savings and efficiency gains for institutions
- **Affordable for Indian market:** Significantly lower than international alternatives (e.g., Mettl at ₹50-₹100/student)
- **Scalable:** Pricing grows with institution size, not per-exam
- **Simple:** No hidden fees, no per-exam charges, no per-student charges beyond plan limit

### 4.2 Competitive Pricing Comparison

| Competitor | Pricing Model | Equivalent Monthly Cost (500 students) |
|---|---|---|
| Mettl | Per-test, per-student | ₹25,000-₹50,000 |
| ThinkExam | Per-student, annual | ₹15,000-₹25,000 |
| Examly | Per-student, per-feature | ₹20,000-₹40,000 |
| Google Forms | Free (no features) | ₹0 |
| EduOMR | Per-institution subscription | ₹2,000-₹5,000 |

### 4.3 Free Trial

- 14-day free trial with full features (limited to 100 students)
- No credit card required
- Auto-expires with reminder 3 days before end

---

## 5. Business Success Metrics

### 5.1 Leading Indicators

| Metric | Year 1 Target | Year 3 Target |
|---|---|---|
| Monthly Active Institutions (MAI) | 80 | 1,500 |
| Monthly Active Students (MAS) | 40,000 | 7,50,000 |
| Exams conducted per month | 200 | 10,000 |
| Subscriptions (paid) | 60 | 1,200 |
| Trial-to-paid conversion | 25% | 40% |

### 5.2 Lagging Indicators

| Metric | Year 1 Target | Year 3 Target |
|---|---|---|
| Monthly Recurring Revenue (MRR) | ₹4,00,000 | ₹1,20,00,000 |
| Annual Recurring Revenue (ARR) | ₹48,00,000 | ₹14,40,00,000 |
| Customer Acquisition Cost (CAC) | ₹20,000 | ₹10,000 |
| Lifetime Value (LTV) | ₹1,20,000 | ₹3,00,000 |
| LTV:CAC Ratio | 6:1 | 30:1 |
| Net Revenue Retention (NRR) | 90% | 120% |
| Churn Rate (monthly) | <5% | <2% |

### 5.3 Quality Metrics

| Metric | Target |
|---|---|
| Platform uptime | 99.9% |
| Exam completion rate | >90% |
| WhatsApp delivery rate | >95% within 5 min |
| Customer satisfaction (CSAT) | >4.0/5.0 |
| Net Promoter Score (NPS) | >50 |

---

## 6. Distribution & Sales Strategy

### 6.1 Channels (Year 1)

| Channel | Strategy | Expected Share |
|---|---|---|
| Direct Sales | In-house sales team contacts school chains and coaching institutes | 50% |
| WhatsApp/Email outreach | Targeted campaigns to school decision-makers | 20% |
| Referral | Existing institutions refer peers (1 month discount per referral) | 15% |
| Education conferences | Booth at national education technology conferences | 10% |
| Digital marketing | Google/LinkedIn ads targeting education administrators | 5% |

### 6.2 Sales Process

1. **Lead generation** — Outreach, referral, or inbound inquiry
2. **Demo** — 30-minute product demo tailored to institution type
3. **Free trial** — 14-day access for evaluation
4. **Conversion** — Purchase subscription via Paytm/UTR
5. **Onboarding** — Guided setup of institution, users, classes, and first exam
6. **Support** — Dedicated WhatsApp group for institution admin

---

## 7. Regulatory & Compliance Requirements

| Requirement | Details | Priority |
|---|---|---|
| Data Privacy | Student PII protected, not shared with third parties | P0 |
| Data Retention | Compliance with Indian IT Act, 2000 | P1 |
| Payment Records | 7-year retention for tax/audit purposes | P1 |
| Accessibility | WCAG 2.1 AA for government institution eligibility | P1 |
| SSL/TLS | All traffic encrypted (TLS 1.3+) | P0 |
| Exam Integrity | Server-side enforcement prevents cheating | P0 |

---

## 8. Business Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Slow adoption by institutions | Medium | High | Focus on early adopter segment (coaching institutes with weekly tests); reduce friction in onboarding |
| Price sensitivity | Medium | Medium | Tiered pricing with low entry point (₹2,000/mo); demonstrate ROI through time/cost savings |
| Competitor launches similar product | Medium | Medium | First-mover advantage; focus on execution speed; build switching costs through data/workflow |
| Regulatory changes in education technology | Low | High | Maintain compliance with NEP 2020; keep platform adaptable to policy changes |
| Economic downturn affects education spending | Low | Medium | Low price point makes it a small budget item; focus on cost-saving value proposition |
| Churn due to poor experience | Medium | High | Invest in onboarding, support, and continuous product improvement |

---

## 9. Success Criteria for MVP Launch

### 9.1 Must-Have for GA

- [ ] 50 institutions active on the platform
- [ ] 25,000+ exams completed successfully
- [ ] Zero data loss incidents
- [ ] 99.9% uptime during exam hours
- [ ] WhatsApp delivery rate >90%
- [ ] Average institution setup time < 1 hour
- [ ] Average exam creation time < 15 minutes
- [ ] NPS score > 30

### 9.2 Nice-to-Have for GA

- [ ] 1,000+ concurrent exam sessions handled
- [ ] Auto-save reliability at 99.99%
- [ ] Student satisfaction score > 4/5
- [ ] Teacher satisfaction score > 4/5

---

## 10. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-14 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved by Founder |

---

## 11. Approval Sign-Off

**Document:** DOC 1.5 — Business Requirements Document
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Business Lead | opencode | 2026-07-14 | ✅ Approved |
