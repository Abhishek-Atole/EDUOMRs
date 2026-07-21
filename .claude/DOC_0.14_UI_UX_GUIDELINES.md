# DOC 0.14 — UI/UX Guidelines

**Document ID:** 0.14  
**Title:** UI/UX Guidelines — Product-Wide Interface and Experience Rules  
**Version:** 1.0.0  
**Status:** Approved  
**Owner:** UI/UX Governance  
**Date:** 2026-07-13  
**Purpose:** Define the product-wide UI/UX guidelines for EduOMR so that every screen, flow, and interaction remains professional, consistent, accessible, and aligned with the product vision.

---

## 1. Mission

These guidelines define how EduOMR should look, feel, and behave for all users.

**Core Principle:**
> The interface must feel like an enterprise product that is easy to trust, easy to learn, and efficient to use.

These guidelines apply to:
- Dashboard screens
- Forms
- Tables
- Exam interfaces
- Mobile views
- Modals and drawers
- Notifications
- Empty states
- Error states

---

## 2. Design Principles

### 2.1 Overall Style

- Professional
- Minimal
- Clean
- Enterprise-grade
- Accessible
- Responsive
- Trustworthy
- Non-childish

### 2.2 Visual Tone

- Avoid flashy gradients unless used sparingly and intentionally
- Avoid cluttered screens
- Avoid excessive animation
- Prefer calm, structured layouts
- Use strong hierarchy to guide attention

### 2.3 Product Language

- Use locked terminology consistently
- Do not use synonyms for approved terms
- Keep labels clear and domain-specific
- Avoid vague or playful wording

---

## 3. Layout Guidelines

### 3.1 Page Structure

Every major page should follow a predictable structure:

- Header / title area
- Context or summary area
- Main content area
- Supporting actions or footer controls

**Guidelines:**
- Keep primary actions visible
- Group related content together
- Avoid overloading a page with too many competing actions
- Use spacing to separate sections clearly

### 3.2 Dashboard Layout

- Show concise summaries first
- Place key metrics near the top
- Keep important actions easy to reach
- Use cards or sections to separate domains of information

### 3.3 Form Layout

- One column on small screens
- Two columns only when it improves readability
- Label above field, not inside the field as the only label
- Put errors directly below the field
- Keep destructive actions separated from primary actions

### 3.4 Table Layout

- Use tables for structured records
- Use compact density for admin views
- Provide sorting and filtering where useful
- Support pagination for large datasets
- Avoid horizontal overflow where possible

---

## 4. Interaction Guidelines

### 4.1 Primary Actions

- Every screen should have a clear primary action when appropriate
- Only one action should dominate the visual hierarchy
- Primary buttons should be visually distinct

### 4.2 Secondary Actions

- Secondary actions should be less prominent than primary actions
- Use outline or subtle styling for secondary actions
- Do not overload the user with too many secondary buttons

### 4.3 Destructive Actions

- Use warning colors and clear labels
- Require confirmation where appropriate
- Explain the impact before the action is completed

### 4.4 Feedback

- Show immediate feedback after user actions
- Use loading states for async operations
- Confirm success when meaningful
- Show errors with guidance, not just failure

### 4.5 Empty States

Empty states must:
- Explain why the page is empty
- Tell the user what to do next
- Feel helpful, not dead-end

---

## 5. Accessibility Guidelines

### 5.1 General Rules

- Use semantic HTML
- Ensure keyboard navigation works
- Ensure visible focus states
- Use accessible labels for inputs and buttons
- Maintain sufficient color contrast

### 5.2 Exam Accessibility

- Timer must be visible and readable
- OMR bubbles must be large enough to tap accurately
- Mode 1 must remain readable on smaller screens
- Mode 2 must not hide critical controls
- Actions must be usable without precision gestures

### 5.3 Error Accessibility

- Errors must not rely on color only
- Error messages must explain the problem
- Error messages should state how to fix the issue where possible

---

## 6. Responsive Behavior

### 6.1 Mobile First

- Start with mobile layout
- Expand layout intentionally for larger screens
- Keep interactions thumb-friendly
- Avoid cramped spacing on small screens

### 6.2 Breakpoint Behavior

- Mobile: single column, stacked controls
- Tablet: simplify density while preserving readability
- Desktop: more information can be visible simultaneously

### 6.3 Exam Mode Rules

#### Exam Mode 1
- Desktop: question panel and OMR panel visible together
- Mobile: stack panels vertically
- Keep navigation clear and accessible

#### Exam Mode 2
- Show only the OMR grid
- Never show questions on the screen
- Keep the instruction banner visible

---

## 7. Content Guidelines

### 7.1 Labels

- Use clear, short, specific labels
- Avoid jargon when a simpler label works
- Use approved terminology exactly

### 7.2 Help Text

- Help text should reduce confusion, not repeat the label
- Keep help text short and relevant
- Place help text where it can be seen easily

### 7.3 Status Text

- Status should be easy to scan
- Use consistent wording for progress and state
- Avoid ambiguous status language

---

## 8. State Guidelines

### 8.1 Loading State

- Use skeletons or spinners where useful
- Avoid blank screens during loading
- Keep loading states consistent across the app

### 8.2 Success State

- Confirm meaningful completion
- Make success visible but not disruptive
- Guide the user to the next step if needed

### 8.3 Error State

- Explain what happened
- Offer corrective action if possible
- Keep the interface stable when an error occurs

### 8.4 Disabled State

- Use disabled states intentionally
- Explain why an action is disabled when helpful
- Avoid hiding functionality without explanation

---

## 9. Navigation Guidelines

- Keep navigation predictable
- Show current location clearly
- Avoid deep hidden menus for common actions
- Use breadcrumbs or section markers where helpful
- Keep mobile navigation compact and accessible

---

## 10. Exam UI Guidelines

### 10.1 Mode 1: Digital Paper + Digital OMR

- Question content must be readable
- OMR selection must be immediate
- Timer must be visible at all times
- Submit action must remain available
- Review and navigation controls must be easy to reach

### 10.2 Mode 2: Physical Paper + Digital OMR

- Display only the OMR sheet
- Do not show question content or hints
- Banner must clearly instruct the student
- Grid must be dense but readable
- Mobile layout must remain usable without cheating opportunities

### 10.3 Result Review Screen

- Show score prominently
- Show percentage and rank clearly
- Show per-question breakdown in a structured way
- Separate correct/incorrect/skipped indicators visually
- Keep the screen readable on mobile and desktop

---

## 11. Motion Guidelines

- Use motion sparingly
- Prefer short, purposeful transitions
- Avoid motion that distracts from the task
- Respect reduced motion preferences
- Animate state changes, not everything

---

## 12. Iconography & Imagery

- Use icons only when they clarify meaning
- Keep icon style consistent
- Avoid decorative imagery that adds no value
- Images should support the task or brand, not distract from it

---

## 13. Error Message Guidelines

Good error messages should:
- State what went wrong
- State what the user can do next
- Avoid blaming the user
- Avoid technical jargon unless necessary

**Example:**
- Good: "Email address is required."
- Good: "The exam has expired and can no longer be submitted."
- Bad: "Validation error 400."

---

## 14. Notification Guidelines

- Notifications should be useful and brief
- Success notifications should not overstay
- Error notifications should be visible until resolved or dismissed
- Critical notifications should not be easy to miss

---

## 15. UI Review Checklist

```markdown
## UI/UX Guidelines Review: [Screen/Flow]

### Visual Design
- [ ] Professional appearance
- [ ] Minimal and clean layout
- [ ] Consistent spacing and hierarchy
- [ ] Approved terminology used

### Usability
- [ ] Primary action obvious
- [ ] Secondary actions clear
- [ ] Destructive actions confirmed
- [ ] Feedback provided for actions

### Responsive
- [ ] Mobile-first layout
- [ ] Tablet and desktop behavior correct
- [ ] No horizontal scrolling on mobile
- [ ] Touch targets large enough

### Accessibility
- [ ] Semantic HTML used
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Contrast acceptable
- [ ] Error messages accessible

### Exam UI
- [ ] Mode 1 shows both panels on desktop
- [ ] Mode 1 stacks on mobile
- [ ] Mode 2 shows only OMR grid
- [ ] Timer visible
- [ ] OMR bubbles easy to tap

### Result
**Status:** ✅ PASS / ⚠️ CONDITIONAL / ❌ FAIL
```

---

## 16. Forbidden UI Patterns

- Cluttered dashboards
- Hidden primary actions
- Tiny touch targets
- Unclear labels
- Inconsistent terminology
- Flashy or childish visual styles
- Mobile layouts that require horizontal scrolling
- Showing Mode 2 questions on screen

---

## 17. UI/UX Sign-Off

This document defines the mandatory UI/UX guidelines for EduOMR.

**No screen or flow is accepted unless:**
1. ✅ It follows the approved design principles
2. ✅ It is responsive and accessible
3. ✅ It uses the locked terminology
4. ✅ It matches the exam-specific rules
5. ✅ It feels professional and easy to use

---

## Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-13 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved after review — all design and exam UI guidelines validated |

---

## Approval Sign-Off

**Document:** DOC 0.14 — UI/UX Guidelines  
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Design Lead | opencode | 2026-07-14 | ✅ Approved |

---

**Next:** After approval, proceed to DOC 0.15 — Definition of Done
