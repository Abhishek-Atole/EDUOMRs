# DOC 0.12 — Coding Standards

**Document ID:** 0.12  
**Title:** Coding Standards — EduOMR Code Style, Structure, and Quality Rules  
**Version:** 1.0.0  
**Status:** Approved  
**Owner:** Code Standards Process  
**Date:** 2026-07-13  
**Purpose:** Define the mandatory coding standards for EduOMR so that all code is consistent, maintainable, secure, testable, and easy to review.

---

## 1. Mission

The Coding Standards document defines how every line of code in EduOMR must be written.

**Core Principle:**
> Code should be easy to read, hard to misuse, and safe to change.

These standards apply to:
- JavaScript source code
- React components
- API controllers
- Services
- Repositories
- Tests
- Scripts
- Configuration files where applicable

---

## 2. Language Rules

### 2.1 JavaScript Standard

EduOMR uses **JavaScript ES2022+ strict mode**.

**Required rules:**
- Use `"use strict";` where applicable
- Use `const` by default
- Use `let` only when reassignment is required
- Never use `var`
- Use semicolons consistently
- Prefer template literals over string concatenation
- Prefer object destructuring for clarity
- Prefer async/await over raw promise chains

**Example:**
```javascript
"use strict";

const studentName = 'Aarav';
let score = 0;

async function loadExam(examId) {
  const { data } = await api.get(`/api/v1/exams/${examId}`);
  return data;
}
```

### 2.2 React Standard

**Required rules:**
- Use functional components
- Use hooks for state and side effects
- Keep components focused and small
- Prefer composition over inheritance
- Use semantic HTML elements
- Avoid unnecessary use of `useMemo` / `useCallback`
- Use controlled components for forms

**Example:**
```jsx
function SubmitButton({ onSubmit, isLoading }) {
  return (
    <button type="button" onClick={onSubmit} disabled={isLoading}>
      {isLoading ? 'Submitting...' : 'Submit'}
    </button>
  );
}
```

---

## 3. Naming Conventions

### 3.1 General Naming Rules

- Use descriptive names
- Avoid abbreviations unless common and clear
- Use singular nouns for single entities
- Use plural nouns for collections
- Use consistent terminology from PROJECT_KNOWLEDGE.md
- Never use banned synonyms for locked terms

### 3.2 Variables

**Rules:**
- Use `camelCase`
- Use nouns for values
- Use boolean prefixes like `is`, `has`, `can`, `should`

**Examples:**
```javascript
const examId = 123;
const totalQuestions = 50;
const isResultReleased = true;
const hasParentPhoneNumber = false;
```

### 3.3 Functions

**Rules:**
- Use verb phrases
- Name by intent, not implementation
- Keep function names specific

**Examples:**
```javascript
function calculateScore() {}
function validateAnswerKey() {}
function releaseResult() {}
function sendWhatsAppNotification() {}
```

### 3.4 Classes

**Rules:**
- Use PascalCase
- Name after responsibility
- Prefer service/repository/controller suffixes where helpful

**Examples:**
```javascript
class ScoreCalculationService {}
class ExamRepository {}
class ResultController {}
```

### 3.5 Constants

**Rules:**
- Use `UPPER_SNAKE_CASE`
- Reserve for fixed values

**Examples:**
```javascript
const MAX_QUESTIONS = 200;
const DEFAULT_PAGE_SIZE = 20;
const WHATSAPP_RETRY_LIMIT = 3;
```

---

## 4. File and Folder Structure

### 4.1 Module Organization

Code must be grouped by business domain, not by technical type alone.

**Preferred structure:**
```
src/
  core/
  education/
  examination/
  communication/
  subscription/
  shared/
```

### 4.2 File Naming

- Use `camelCase` for JavaScript files where the project already follows it
- Use consistent names for tests: `*.test.js` or `*.spec.js`
- Keep one primary class or concern per file where reasonable

**Examples:**
- `scoreCalculationService.js`
- `examRepository.js`
- `releaseResultController.js`
- `scoreCalculationService.test.js`

### 4.3 Folder Naming

- Use lowercase folders
- Use descriptive domain names
- Avoid vague folders like `misc`, `stuff`, `temp`, `old`

---

## 5. Code Style Rules

### 5.1 Indentation and Formatting

- Use 2 spaces for indentation
- Keep lines reasonably short and readable
- Use blank lines to separate logical blocks
- Keep function bodies focused
- Do not over-format code into unreadable one-liners

### 5.2 Comments

**Rules:**
- Comment only when the code is not self-evident
- Explain why, not what
- Avoid stale comments
- Remove commented-out code
- Keep comments short and useful

**Examples:**
```javascript
// Keep tenant scoping at the repository layer so isolation is enforced consistently.
const exams = await examRepository.findByTenant(tenantId);
```

### 5.3 Error Handling

**Rules:**
- Throw specific errors
- Catch only when you can handle or add useful context
- Never swallow errors silently
- Return consistent error objects from APIs
- Do not expose stack traces to users

**Example:**
```javascript
try {
  await resultService.releaseResult(examId);
} catch (error) {
  logger.error('Failed to release result', { examId, error });
  throw error;
}
```

### 5.4 Imports

**Rules:**
- Group imports logically
- Remove unused imports
- Prefer explicit imports over wildcard imports where possible
- Keep order consistent

---

## 6. Function Design Rules

### 6.1 Single Responsibility

Each function should do one clear thing.

**Good:**
```javascript
function calculatePercentage(score, totalPossibleMarks) {
  return Number(((score / totalPossibleMarks) * 100).toFixed(2));
}
```

**Bad:**
```javascript
function processExamSubmission(req, res) {
  // validates input, checks auth, calculates score, saves result,
  // queues notifications, and formats response
}
```

### 6.2 Function Size

- Prefer small functions
- If a function grows beyond one screen, consider splitting it
- Keep nested logic shallow

### 6.3 Parameters

- Prefer few parameters
- Group related parameters into objects
- Avoid boolean flags when an enum or object is clearer

**Example:**
```javascript
calculateScore(answers, answerKey, {
  marksPerCorrect,
  marksPerWrong,
  clampToZero,
});
```

---

## 7. API Coding Standards

### 7.1 Controller Rules

- Controllers handle request/response only
- Controllers must not contain business logic
- Controllers must not query the database directly
- Controllers must validate input using Zod
- Controllers must call services, not repositories, when possible

**Example:**
```javascript
async function submitExamController(req, res, next) {
  try {
    const payload = submitExamSchema.parse(req.body);
    const result = await examSubmissionService.submitExam(req.user, payload);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
```

### 7.2 Service Rules

- Services contain business logic
- Services may coordinate multiple repositories
- Services must not know HTTP details
- Services must be testable without the web layer

### 7.3 Repository Rules

- Repositories handle data access only
- Repositories enforce tenant scoping
- Repositories use parameterized queries only
- Repositories must not expose raw database details to callers

---

## 8. Security Coding Standards

### 8.1 Input Validation

- Validate every external input
- Use Zod for request payloads and parameters
- Reject invalid data early

### 8.2 Sensitive Data

- Never log passwords, tokens, answer keys, or secrets
- Never send answer keys to clients
- Never store secrets in source code

### 8.3 Tenant Safety

- tenant_id must come from authenticated JWT context
- tenant_id must not be accepted from user input
- All tenant-scoped queries must include tenant_id filter

### 8.4 SQL Safety

- Use parameterized queries only
- Never concatenate user input into SQL
- Prefer ORM methods that parameterize safely

---

## 9. Testing Standards

### 9.1 Test Naming

Tests should describe behavior clearly.

**Good:**
```javascript
it('returns 403 when student accesses another exam session', () => {});
```

**Bad:**
```javascript
it('test 1', () => {});
```

### 9.2 Test Structure

- Arrange, Act, Assert
- One logical behavior per test
- Use mocks for external dependencies
- Keep tests deterministic

### 9.3 Test Data

- Use explicit fixtures
- Avoid magic values without meaning
- Keep test data minimal and focused

---

## 10. Logging Standards

- Log meaningful events
- Include request ID when possible
- Include tenant context where relevant
- Use structured logs
- Avoid noisy or duplicated logs

**Example:**
```javascript
logger.info('Result released', {
  examId,
  tenantId,
  studentCount,
});
```

---

## 11. Performance Coding Standards

- Avoid unnecessary loops and repeated database calls
- Prefer batching where appropriate
- Cache read-heavy reference data
- Keep hot paths simple
- Avoid blocking the event loop with CPU-heavy work
- Offload long-running work to the queue

---

## 12. UI Coding Standards

- Use semantic HTML
- Keep components focused
- Make state changes explicit
- Provide loading and error states
- Ensure responsive layouts
- Use accessible labels and roles

---

## 13. Dependency Standards

- Add dependencies only when needed
- Prefer stable, maintained packages
- Avoid duplicate libraries for the same purpose
- Document why a dependency was added
- Verify security and performance impact before adoption

---

## 14. Review Checklist

```markdown
## Coding Standards Review: [File/Feature]

### Naming
- [ ] Variables descriptive
- [ ] Functions verb-based
- [ ] Classes responsibility-based
- [ ] Locked terminology followed

### Structure
- [ ] Single responsibility preserved
- [ ] File organization sensible
- [ ] Functions small enough
- [ ] No unnecessary nesting

### Safety
- [ ] Input validated
- [ ] No secrets in code
- [ ] No SQL concatenation
- [ ] Tenant scoping enforced

### Quality
- [ ] Tests written or updated
- [ ] Logging appropriate
- [ ] Error handling consistent
- [ ] No dead code introduced

### UI/React
- [ ] Semantic HTML used
- [ ] Accessible labels present
- [ ] Responsive behavior preserved
- [ ] No unnecessary re-renders

### Result
**Status:** ✅ PASS / ⚠️ CONDITIONAL / ❌ FAIL
```

---

## 15. Forbidden Patterns

- `var` declarations
- Silent catch blocks
- Hardcoded secrets
- Direct database access in controllers
- Business logic in controllers
- `SELECT *` in production queries
- `dangerouslySetInnerHTML` without sanitization
- Unused code left behind after refactoring
- Inconsistent naming for locked terminology

---

## 16. Coding Standards Sign-Off

This document defines the mandatory coding rules for EduOMR.

**No code is accepted unless:**
1. ✅ It follows the approved naming and structure rules
2. ✅ It keeps business logic in the correct layer
3. ✅ It validates inputs and protects sensitive data
4. ✅ It includes appropriate tests
5. ✅ It preserves project terminology and architecture rules

---

## Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-13 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved after review — naming, security, layer rules validated |

---

## Approval Sign-Off

**Document:** DOC 0.12 — Coding Standards  
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-14 | ✅ Approved |

---

**Next:** After approval, proceed to DOC 0.13 — Architecture Rules
