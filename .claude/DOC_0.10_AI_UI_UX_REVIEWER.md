# DOC 0.10 — AI UI/UX Reviewer

**Document ID:** 0.10  
**Title:** AI UI/UX Reviewer — Design Review & Usability Protocol  
**Version:** 1.0.0  
**Status:** Approved  
**Owner:** AI UI/UX Review Process  
**Date:** 2026-07-13  
**Purpose:** Define the comprehensive UI/UX review protocol for all frontend design, user flows, and interface decisions in EduOMR to ensure professional, accessible, and user-centric design.

---

## 1. Mission

The AI UI/UX Reviewer is responsible for:

- **Design Consistency:** Enforcing cohesive visual language
- **Usability Validation:** Ensuring interfaces are intuitive
- **Accessibility Assurance:** Meeting WCAG 2.1 AA standards
- **Responsive Design:** Ensuring mobile-first, multi-device compatibility
- **User Experience:** Optimizing workflows and reducing friction
- **Enterprise Standards:** Maintaining professional appearance
- **Performance:** Ensuring fast, smooth interactions

Every UI/UX review must enforce:
- **Professional Design** (not flashy, not childish)
- **Minimal Aesthetic** (clean, focused, no clutter)
- **Enterprise Look & Feel** (inspired by Notion, Linear, GitHub, Jira)
- **Mobile-First Responsive Design**
- **Dark Mode & Light Mode Support**
- **WCAG 2.1 AA Accessibility**
- **Fast, Smooth Interactions** (< 300ms response)

---

## 2. Design System & Brand

### 2.1 Color Palette

**Primary Colors:**
| Name | Hex | Usage |
|---|---|---|
| Primary | #2563EB | Links, buttons, highlights |
| Success | #16A34A | Confirmations, positive states |
| Warning | #EA580C | Cautions, warnings |
| Error | #DC2626 | Errors, destructive actions |
| Neutral-900 | #111827 | Dark text (light mode) |
| Neutral-50 | #F9FAFB | Light background (dark mode) |

**Neutral Scale (for borders, dividers, backgrounds):**
```
Neutral-50:  #F9FAFB  (lightest)
Neutral-100: #F3F4F6
Neutral-200: #E5E7EB
Neutral-300: #D1D5DB
Neutral-400: #9CA3AF
Neutral-500: #6B7280  (middle)
Neutral-600: #4B5563
Neutral-700: #374151
Neutral-800: #1F2937
Neutral-900: #111827  (darkest)
```

**Dark Mode Mapping:**
- Light mode background → dark mode: Neutral-900
- Light mode text → dark mode: Neutral-50
- Light mode border → dark mode: Neutral-700

### 2.2 Typography

**Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
```

**Type Scale:**
| Type | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| H1 | 32px | Bold (700) | 1.2 | Page titles |
| H2 | 24px | Bold (700) | 1.3 | Section headings |
| H3 | 20px | Bold (700) | 1.4 | Subsection headings |
| Body | 16px | Regular (400) | 1.5 | Main text |
| Small | 14px | Regular (400) | 1.5 | Secondary text |
| Tiny | 12px | Regular (400) | 1.4 | Labels, captions |

### 2.3 Spacing

**Spacing Scale (8px base):**
```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
```

**Usage:**
- Padding: `md` for sections, `sm` for components
- Margin: `lg` between major sections, `md` between components
- Gap: `md` in flex/grid layouts

### 2.4 Border Radius

```
Subtle:    2px    (input fields, small elements)
Default:   4px    (buttons, cards)
Rounded:   8px    (modals, larger containers)
Full:      50%    (avatars, circles)
```

### 2.5 Shadows

```
sm:  0 1px 2px 0 rgba(0,0,0,0.05)
md:  0 4px 6px -1px rgba(0,0,0,0.1)
lg:  0 10px 15px -3px rgba(0,0,0,0.1)
xl:  0 20px 25px -5px rgba(0,0,0,0.1)
```

---

## 3. Component Design Standards

### 3.1 Buttons

**Primary Button:**
```jsx
<button className="px-md py-sm bg-primary-500 text-white rounded-default hover:bg-primary-600 active:bg-primary-700 transition-colors duration-200">
  Create Exam
</button>
```

**Styles:**
- Default: Primary color
- Hover: Darker primary color (hover state visible)
- Active: Even darker (pressed state)
- Disabled: Neutral-400 with opacity 50%

**Sizes:**
- Large: 16px text, 12px padding
- Default: 14px text, 8px padding
- Small: 12px text, 4px padding

**States:**
- Default: Blue
- Hover: Darker blue
- Active/Pressed: Even darker
- Disabled: Gray, cursor not-allowed
- Loading: Spinner animation

**Checklist:**
- [ ] Minimum 44x44px touch target
- [ ] Clear hover state
- [ ] Visible focus indicator (keyboard navigation)
- [ ] Loading state shows spinner
- [ ] Disabled state visually distinct

### 3.2 Form Fields

**Input Field:**
```jsx
<input
  className="w-full px-md py-sm border border-neutral-300 rounded-default focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
  placeholder="Enter email"
/>
```

**Styles:**
- Border: 1px solid Neutral-300 (light mode), Neutral-700 (dark mode)
- Focus: 2px ring around field
- Error: Border becomes Error color
- Disabled: Background Neutral-100, cursor not-allowed

**Label:**
```jsx
<label className="block text-sm font-medium text-neutral-900 mb-xs">
  Email Address
</label>
<input />
```

**Error Message:**
```jsx
<p className="mt-xs text-sm text-error-600">
  ✕ Email is required
</p>
```

**Checklist:**
- [ ] Label clearly associated with field
- [ ] Error messages visible and actionable
- [ ] Placeholder text is hint (not label)
- [ ] Focus ring visible (2px minimum)
- [ ] Touch target 44x44px minimum
- [ ] Input type matches data (email, number, date, etc.)

### 3.3 Cards

**Card Component:**
```jsx
<div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-lg shadow-md">
  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
    Exam Title
  </h3>
  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-sm">
    Description
  </p>
</div>
```

**Styles:**
- Background: White (light), Neutral-800 (dark)
- Border: 1px solid Neutral-200 (light), Neutral-700 (dark)
- Padding: `lg` (24px)
- Border-radius: `rounded-lg` (8px)
- Shadow: `md` (subtle shadow)

**Checklist:**
- [ ] Dark mode background applied
- [ ] Text contrast meets WCAG AA (4.5:1 minimum)
- [ ] Hover state if interactive
- [ ] Consistent spacing inside card

### 3.4 Tables

**Table Structure:**
```jsx
<table className="w-full">
  <thead className="bg-neutral-100 dark:bg-neutral-700">
    <tr>
      <th className="px-md py-sm text-left text-sm font-semibold">Name</th>
      <th className="px-md py-sm text-left text-sm font-semibold">Score</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
      <td className="px-md py-sm">John Doe</td>
      <td className="px-md py-sm">85%</td>
    </tr>
  </tbody>
</table>
```

**Styles:**
- Header: Neutral-100 background (light), Neutral-700 (dark)
- Rows: Alternating subtle background (optional)
- Hover: Slight highlight on hover
- Padding: `md` cells

**Checklist:**
- [ ] Headers clearly distinguished
- [ ] Data rows scannable
- [ ] Sortable columns have visual indicator
- [ ] Responsive: stack on mobile (not horizontal scroll)
- [ ] Focus visible on focusable elements

---

## 4. Responsive Design Standards

### 4.1 Breakpoints

```
Mobile:    0-639px     (xs, sm)
Tablet:    640-1023px  (md, lg)
Desktop:   1024px+     (xl, 2xl)
```

**Mobile-First Approach:**
1. Design for mobile (smallest)
2. Add complexity for tablet
3. Optimize for desktop

### 4.2 Layout Examples

**Single Column (Mobile) → Two Columns (Tablet) → Three Columns (Desktop):**

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  {/* Cards automatically stack on mobile, 2 per row on tablet, 3 on desktop */}
</div>
```

**Navigation Drawer (Mobile) → Sidebar (Desktop):**

```jsx
{/* Mobile: Hidden by default, opens in drawer */}
<nav className="md:hidden">
  <Drawer isOpen={isOpen} onClose={closeDrawer}>
    {/* Nav items */}
  </Drawer>
</nav>

{/* Desktop: Sidebar visible */}
<nav className="hidden md:block fixed w-64">
  {/* Nav items */}
</nav>
```

### 4.3 Responsive Images

```jsx
<img 
  src="image-large.jpg" 
  srcSet="image-sm.jpg 640w, image-md.jpg 1024w, image-lg.jpg 1280w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Description"
  className="w-full h-auto"
/>
```

**Checklist:**
- [ ] Mobile-first design applied
- [ ] No horizontal scrolling on mobile
- [ ] Touch targets 44x44px on mobile
- [ ] Images responsive (srcSet provided)
- [ ] Typography scales appropriately
- [ ] Tested on common devices (iPhone, iPad, Desktop)

---

## 5. Exam UI Specific Design

### 5.1 Exam Mode 1: Digital Paper + Digital OMR

**Layout Requirements (from PROJECT_KNOWLEDGE.md):**

```
┌─────────────────────────────────────────────────────────┐
│  Exam Title              ⏱ 01:23:45          [Submit]   │
├──────────────────────────┬──────────────────────────────┤
│  QUESTION PANEL          │  OMR ANSWER SHEET            │
│                          │                              │
│  Q1. What is 2 + 2?      │  1.  ●A  ○B  ○C  ○D        │
│  A. 3   B. 4             │  2.  ○A  ○B  ●C  ○D        │
│  C. 5   D. 6             │  3.  ○A  ○B  ○C  ○D        │
│                          │  4.  ○A  ●B  ○C  ○D        │
│  Q2. Capital of India?   │  5.  ○A  ○B  ○C  ○D        │
│  A. Mumbai  B. Delhi     │                              │
│  C. Chennai D. Kolkata   │  Answered : 23              │
│                          │  Skipped  : 4               │
│  [◀ Prev]   [Next ▶]     │  Marked   : 3               │
└──────────────────────────┴──────────────────────────────┘
```

**Desktop Design Considerations:**
- [ ] Left panel (questions) and right panel (OMR) side-by-side
- [ ] Both panels visible simultaneously
- [ ] Panels scroll independently (question on left, OMR on right)
- [ ] Adequate contrast between panels
- [ ] Timer always visible (top-right, changes color when < 5min)
- [ ] Submit button always accessible (top-right)

**Mobile Design Considerations:**
- [ ] Panels stack vertically (question on top, OMR below)
- [ ] Large tabs to switch between panels (not simultaneous)
- [ ] Timer visible in both views
- [ ] OMR bubbles large enough for touch (50x50px minimum)
- [ ] Swipe gesture to navigate questions (alternative to buttons)

**Question Panel:**
```jsx
<div className="bg-white dark:bg-neutral-800 p-lg">
  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-md">
    Q{questionNumber}. {questionText}
  </h3>
  
  <div className="space-y-md">
    {/* Options */}
    {options.map((option, idx) => (
      <button
        key={idx}
        className={`w-full text-left px-md py-sm border-2 rounded-md transition-colors ${
          selectedAnswer === option
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-300'
        }`}
        onClick={() => selectAnswer(option)}
      >
        {option}
      </button>
    ))}
  </div>
  
  <div className="flex justify-between mt-lg">
    <button className="px-md py-sm border border-neutral-300 rounded-md">◀ Previous</button>
    <button className="px-md py-sm border border-neutral-300 rounded-md">Next ▶</button>
  </div>
</div>
```

**OMR Sheet:**
```jsx
<div className="bg-white dark:bg-neutral-800 p-lg">
  <h3 className="text-lg font-semibold mb-lg">Answer Sheet</h3>
  
  <div className="grid grid-cols-4 gap-md">
    {questions.map((q, idx) => (
      <div key={idx} className="text-center">
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-xs">Q{idx + 1}</p>
        <div className="flex gap-xs justify-center">
          {['A', 'B', 'C', 'D'].map((opt) => (
            <button
              key={opt}
              className={`w-12 h-12 rounded border-2 transition-colors ${
                studentAnswers[idx] === opt
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700'
              }`}
              onClick={() => selectAnswer(idx, opt)}
            >
              <span className={studentAnswers[idx] === opt ? 'text-white font-bold' : ''}>
                {opt}
              </span>
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
  
  <div className="mt-lg pt-lg border-t border-neutral-200 dark:border-neutral-700">
    <p className="text-sm text-neutral-600 dark:text-neutral-400">
      Answered: <span className="font-semibold text-primary-600">{answeredCount}</span>
    </p>
    <p className="text-sm text-neutral-600 dark:text-neutral-400">
      Skipped: <span className="font-semibold text-warning-600">{skippedCount}</span>
    </p>
    <p className="text-sm text-neutral-600 dark:text-neutral-400">
      Marked: <span className="font-semibold text-neutral-600">{markedCount}</span>
    </p>
  </div>
</div>
```

**OMR Bubble Design:**
- Filled bubble: Solid color (primary-500)
- Empty bubble: Border only, white fill
- Size: 48x48px minimum (mobile), 40x40px (desktop)
- Clear visual feedback on selection
- Hover state shows selection possibility

**Timer Display:**
```jsx
<div className={`text-lg font-bold ${timeRemaining < 300 ? 'text-error-600' : 'text-neutral-600'}`}>
  ⏱ {formatTime(timeRemaining)}
</div>
```

- Always visible
- Turns red when < 5 minutes
- Updates every second (smooth, no jumps)
- Server-synchronized (not trusted client-side)

**Checklist (Mode 1):**
- [ ] Both panels visible on desktop
- [ ] Panels stack on mobile
- [ ] OMR bubbles 48x48px minimum
- [ ] Timer visible and red when < 5min
- [ ] Questions readable on all screen sizes
- [ ] Submit button always accessible
- [ ] No horizontal scrolling on mobile

### 5.2 Exam Mode 2: Physical Paper + Digital OMR

**Key Difference:** NO questions displayed

```
┌─────────────────────────────────────────────────────────┐
│  Exam Title              ⏱ 01:23:45          [Submit]   │
│  📄 Answer according to your physical question paper    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   OMR ANSWER SHEET — 50 Questions                      │
│                                                         │
│  Q01  ○A  ●B  ○C  ○D      Q26  ○A  ○B  ●C  ○D        │
│  Q02  ●A  ○B  ○C  ○D      Q27  ○A  ○B  ○C  ●D        │
│  Q03  ○A  ○B  ○C  ○D      Q28  ○A  ●B  ○C  ○D        │
│  Q04  ○A  ○B  ●C  ○D      Q29  ●A  ○B  ○C  ○D        │
│  Q05  ○A  ○B  ○C  ○D      Q30  ○A  ○B  ○C  ○D        │
│  ...                       ...                          │
│                                                         │
│  ████████████░░░░░  Filled: 32 / 50    Skipped: 18     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design Considerations:**
- [ ] NO question text on screen (enforced by backend)
- [ ] Only OMR grid visible
- [ ] Banner message: "Answer according to your physical question paper"
- [ ] Progress bar shows filled questions
- [ ] Mobile: Multiple rows of questions (scrollable)
- [ ] Desktop: Compact grid layout (5-6 questions per row)

**Checklist (Mode 2):**
- [ ] Question text completely absent (impossible to read)
- [ ] OMR grid fills screen
- [ ] Progress bar shows completion
- [ ] Physical paper essential (can't cheat from screen)
- [ ] Mobile layout fits questions in reasonable columns

---

## 6. Accessibility Standards (WCAG 2.1 AA)

### 6.1 Color Contrast

**Requirement:** 4.5:1 for normal text, 3:1 for large text

```jsx
// Check contrast
// Dark text on light background
// Neutral-900 (#111827) on white (#FFFFFF) = 13.6:1 ✅

// Light text on dark background
// Neutral-50 (#F9FAFB) on Neutral-900 (#111827) = 13.6:1 ✅
```

**Checklist:**
- [ ] All text meets 4.5:1 contrast minimum
- [ ] Large text (18px+ or 14px bold) meets 3:1 minimum
- [ ] Info not conveyed by color alone (use patterns, icons)
- [ ] Links distinguishable without color (underline or icon)

### 6.2 Keyboard Navigation

**Requirements:**
- All interactive elements accessible via Tab
- Visible focus indicator on all elements
- Tab order logical (left-to-right, top-to-bottom)
- No keyboard traps

```jsx
// ✅ Good: Visible focus indicator
button:focus {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}

// ✅ Good: Skip link to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

**Checklist:**
- [ ] All buttons, links, inputs keyboard-accessible
- [ ] Tab order logical (no random jumping)
- [ ] Focus indicator visible (not hidden/removed)
- [ ] No keyboard traps (can always Tab out)
- [ ] Escape key closes modals/drawers
- [ ] Tested with keyboard only

### 6.3 Screen Reader Support

**Requirements:**
- Semantic HTML (use `<button>`, not `<div>`)
- ARIA labels where needed
- Image alt text
- Form labels associated

```jsx
// ✅ Good: Semantic HTML
<button onClick={handleSubmit}>Submit Exam</button>

// ✅ Good: ARIA labels
<button aria-label="Close dialog" onClick={closeDialog}>×</button>

// ✅ Good: Image alt text
<img src="exam-cover.jpg" alt="Math Quiz cover image" />

// ✅ Good: Associated labels
<label htmlFor="email-input">Email Address</label>
<input id="email-input" type="email" />

// ❌ Bad: Non-semantic HTML
<div className="button" onClick={handleSubmit}>Submit</div>

// ❌ Bad: Missing alt text
<img src="exam-cover.jpg" />
```

**Checklist:**
- [ ] Semantic HTML used (button, nav, main, section, etc.)
- [ ] ARIA labels for icons without text
- [ ] Image alt text present and descriptive
- [ ] Form labels associated (for/id or nested)
- [ ] Headings hierarchical (H1 → H2 → H3, no skipping)
- [ ] List items in `<ul>` or `<ol>`, not divs

### 6.4 Mobile & Touch

**Touch Targets:**
- Minimum 44x44px
- Spacing between targets

```jsx
// ✅ Good: Adequate touch target
<button className="w-11 h-11 px-md py-md">Click me</button>

// ❌ Bad: Too small
<button className="w-4 h-4">X</button>
```

**Checklist:**
- [ ] Touch targets 44x44px minimum
- [ ] Spacing between targets (8px minimum)
- [ ] No horizontal scrolling on mobile
- [ ] Zoom/pinch available (meta viewport not disabled)
- [ ] Tested on actual mobile devices

---

## 7. Performance & Animation

### 7.1 Interaction Response

**Targets:**
- Button click → visual feedback: < 100ms
- Page navigation: < 500ms
- Form submission: < 1000ms

```jsx
// ✅ Good: Immediate visual feedback
<button
  className="hover:bg-primary-600 active:bg-primary-700 transition-colors duration-100"
  onClick={handleSubmit}
>
  Submit
</button>

// ❌ Bad: No visual feedback (feels unresponsive)
<button onClick={handleSubmit}>Submit</button>
```

### 7.2 Animations

**Best Practices:**
- Use `transform` and `opacity` (GPU-accelerated)
- Avoid animating `width`, `height`, `left`, `top` (expensive)
- Keep animations short (200-300ms)
- Provide `prefers-reduced-motion` option

```jsx
// ✅ Good: GPU-accelerated animation
<div className="transition-transform duration-300 ease-out" style={{ transform: `translateX(${offset}px)` }}>
  Content
</div>

// ✅ Good: Respect prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

// ❌ Bad: Animating layout properties (janky)
<div style={{ width: animate ? '100%' : '0%' }}>
  Content
</div>
```

**Checklist:**
- [ ] Animations smooth (60 FPS)
- [ ] Animations short (< 500ms)
- [ ] Button clicks have visual feedback
- [ ] prefers-reduced-motion respected
- [ ] No animation on page load (unless intentional)

---

## 8. Dark Mode Implementation

### 8.1 Dark Mode Support

**CSS Approach (Tailwind):**
```jsx
// Light mode (default)
<div className="bg-white text-neutral-900">
  Content
</div>

// Dark mode
<div className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50">
  Content
</div>
```

**System Preference:**
```javascript
// Detect system preference
const darkModePreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Apply class to root element
document.documentElement.classList.toggle('dark', darkModePreferred);
```

**User Override:**
```javascript
// Allow user to toggle
function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
```

**Checklist:**
- [ ] All colors have dark mode equivalents
- [ ] Contrast maintained in both modes
- [ ] Dark mode toggle accessible
- [ ] Preference persisted (localStorage)
- [ ] Respects system preference initially
- [ ] Tested in both modes

---

## 9. UI/UX Review Checklist

```markdown
## UI/UX Review: [Feature/Page Name]

### Status: ✅ PASS | ⚠️  CONDITIONAL PASS | ❌ FAIL

### Design System Compliance
- [ ] Colors from approved palette
- [ ] Typography follows scale
- [ ] Spacing follows 8px grid
- [ ] Border radius consistent
- [ ] Shadows applied correctly

### Component Design
- [ ] Buttons: Clear, accessible, states defined
- [ ] Form fields: Labels, errors, validation visible
- [ ] Cards: Consistent styling, spacing
- [ ] Tables: Readable, responsive, scannable
- [ ] Modals: Clear purpose, easy to close

### Responsive Design
- [ ] Mobile-first approach
- [ ] Breakpoints: mobile (640px), tablet (1024px)
- [ ] No horizontal scrolling on mobile
- [ ] Images responsive (srcSet)
- [ ] Touch targets 44x44px minimum

### Exam UI Specific
- [ ] Mode 1: Both panels visible on desktop, stacked on mobile
- [ ] Mode 2: Questions NOT visible (only OMR grid)
- [ ] OMR bubbles: 48x50px minimum
- [ ] Timer: Always visible, red < 5min
- [ ] Progress: Clear indication of completion

### Accessibility (WCAG 2.1 AA)
- [ ] Color contrast: 4.5:1 minimum
- [ ] Keyboard navigation: All elements accessible
- [ ] Focus indicator: Visible on all interactive elements
- [ ] Screen reader: Semantic HTML, ARIA labels, alt text
- [ ] Mobile: Touch targets, no horizontal scroll, zoom available

### Performance
- [ ] Interactions responsive (< 100ms)
- [ ] Animations smooth (60 FPS)
- [ ] prefers-reduced-motion respected
- [ ] Loading states shown (spinners, skeletons)
- [ ] No janky scrolling or rendering

### Dark Mode
- [ ] All colors have dark mode equivalents
- [ ] Contrast maintained in dark mode
- [ ] Toggle accessible
- [ ] Preference persisted

### Usability
- [ ] Clear information hierarchy
- [ ] Error messages actionable
- [ ] Forms minimal and focused
- [ ] Loading states clear
- [ ] Success confirmations provided
- [ ] Undo available for destructive actions (if applicable)

### Browser & Device Support
- [ ] Chrome/Safari/Firefox latest versions
- [ ] Mobile: iOS 12+, Android 8+
- [ ] No console errors
- [ ] Tested on real devices

### Findings
[List of issues found]

### Recommendations
[Ordered by priority]

### Approved By
[Designer/UX Lead]
Date: YYYY-MM-DD
```

---

## 10. Anti-Patterns to Avoid

### 10.1 Unclear Call-to-Action

❌ **Bad:**
```jsx
<button className="text-gray-400">Maybe</button>
```

✅ **Good:**
```jsx
<button className="px-md py-sm bg-primary-500 text-white font-semibold rounded">
  Submit Exam
</button>
```

### 10.2 Flashy, Unprofessional Design

❌ **Bad:**
- Bright neon colors
- Lots of animations
- Comic Sans or overly decorative fonts
- Inconsistent styling

✅ **Good:**
- Professional color palette
- Minimal animations (functional)
- Clean, system fonts
- Consistent design system

### 10.3 Poor Mobile Experience

❌ **Bad:**
- Horizontal scrolling
- Tiny touch targets (< 44px)
- Desktop layout forced on mobile
- Text too small to read

✅ **Good:**
- Mobile-first responsive design
- 44px touch targets
- Stack layouts vertically
- Readable text on all devices

### 10.4 Accessibility Neglect

❌ **Bad:**
```jsx
<div onClick={handleClick} className="text-blue-500 cursor-pointer">
  Click me
</div>
```

✅ **Good:**
```jsx
<button onClick={handleClick} className="text-primary-600 font-semibold">
  Click me
</button>
```

---

## 11. Design Review Sign-Off

This document defines the mandatory UI/UX review protocol for EduOMR.

**No UI/UX change is accepted without:**
1. ✅ Design system compliance
2. ✅ Responsive design (mobile-first)
3. ✅ WCAG 2.1 AA accessibility
4. ✅ Dark mode support
5. ✅ Professional appearance
6. ✅ Clear user flows
7. ✅ Performance optimized
8. ✅ Tested on real devices

---

## Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-13 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved after review — all design dimensions validated |

---

## Approval Sign-Off

**Document:** DOC 0.10 — AI UI/UX Reviewer  
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Designer | opencode | 2026-07-14 | ✅ Approved |

---

**Next:** After approval, proceed to DOC 0.11 — AI Loop Framework
