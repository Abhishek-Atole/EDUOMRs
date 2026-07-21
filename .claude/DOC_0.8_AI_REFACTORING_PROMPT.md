# DOC 0.8 — AI Refactoring Prompt

**Document ID:** 0.8  
**Title:** AI Refactoring Prompt — Code Refactoring Guidelines & Safety Protocol  
**Version:** 1.0.0  
**Status:** Approved  
**Owner:** AI Refactoring Process  
**Date:** 2026-07-13  
**Purpose:** Define the comprehensive refactoring protocol for improving code quality, maintainability, and performance while ensuring no behavioral changes and zero regressions.

---

## 1. Mission

The AI Refactoring framework is responsible for:

- **Improving Code Quality:** Readability, maintainability, consistency
- **Reducing Complexity:** Cyclomatic complexity, cognitive load
- **Enhancing Performance:** Efficient algorithms, better caching, optimized queries
- **Enforcing Standards:** Adherence to architecture principles, coding standards
- **Preventing Regressions:** All tests pass before and after refactoring
- **Maintaining Behavior:** Refactoring changes ONLY how code is written, not what it does

**Core Principle:**
> Refactoring is the art of improving code structure WITHOUT changing behavior.
> If behavior changes, it's not refactoring—it's a feature or bug fix.

---

## 2. Types of Refactoring

### 2.1 Safe Refactoring (Always OK)

**Extract Function:**
```javascript
// Before
function processExam(exam) {
  const score = exam.correct * 4 - exam.wrong * 1;
  const percentage = (score / exam.total_marks) * 100;
  const grade = percentage > 80 ? 'A' : percentage > 60 ? 'B' : 'C';
  console.log(`Score: ${score}, Grade: ${grade}`);
}

// After
function calculateScore(exam) {
  return exam.correct * 4 - exam.wrong * 1;
}

function calculatePercentage(score, totalMarks) {
  return (score / totalMarks) * 100;
}

function assignGrade(percentage) {
  return percentage > 80 ? 'A' : percentage > 60 ? 'B' : 'C';
}

function processExam(exam) {
  const score = calculateScore(exam);
  const percentage = calculatePercentage(score, exam.total_marks);
  const grade = assignGrade(percentage);
  console.log(`Score: ${score}, Grade: ${grade}`);
}
```

**Rename Variables for Clarity:**
```javascript
// Before
function calcScore(ans, key, cfg) {
  let sc = 0;
  for (let i = 0; i < ans.length; i++) {
    if (ans[i] === key[i]) sc += cfg.mc;
  }
  return sc;
}

// After
function calculateScore(studentAnswers, answerKey, config) {
  let score = 0;
  for (let i = 0; i < studentAnswers.length; i++) {
    if (studentAnswers[i] === answerKey[i]) {
      score += config.marksPerCorrect;
    }
  }
  return score;
}
```

**Replace Loop with forEach/map:**
```javascript
// Before
function getStudentScores(students, exams) {
  const scores = [];
  for (let i = 0; i < students.length; i++) {
    const exam = exams[i];
    const score = calculateScore(exam);
    scores.push(score);
  }
  return scores;
}

// After
function getStudentScores(students, exams) {
  return exams.map(exam => calculateScore(exam));
}
```

**Remove Dead Code:**
```javascript
// Before
function submitExam(answers) {
  const oldScore = calculateScore(answers); // Never used
  const newScore = calculateScoreV2(answers);
  return newScore;
}

// After
function submitExam(answers) {
  return calculateScoreV2(answers);
}
```

**Extract Constant:**
```javascript
// Before
if (percentage > 80) grade = 'A';
if (percentage > 60) grade = 'B';
if (percentage > 40) grade = 'C';

// After
const GRADE_THRESHOLDS = {
  A: 80,
  B: 60,
  C: 40,
};

function assignGrade(percentage) {
  for (const [grade, threshold] of Object.entries(GRADE_THRESHOLDS)) {
    if (percentage > threshold) return grade;
  }
  return 'F';
}
```

**Consolidate Duplicate Code:**
```javascript
// Before
app.get('/api/exams/:id', authenticate, (req, res) => {
  logger.info(`User ${req.user.id} accessed exam ${req.params.id}`);
  const exam = db.getExam(req.params.id);
  res.json(exam);
});

app.get('/api/results/:id', authenticate, (req, res) => {
  logger.info(`User ${req.user.id} accessed result ${req.params.id}`);
  const result = db.getResult(req.params.id);
  res.json(result);
});

// After
function logAccess(req, resourceType, resourceId) {
  logger.info(`User ${req.user.id} accessed ${resourceType} ${resourceId}`);
}

app.get('/api/exams/:id', authenticate, (req, res) => {
  logAccess(req, 'exam', req.params.id);
  const exam = db.getExam(req.params.id);
  res.json(exam);
});

app.get('/api/results/:id', authenticate, (req, res) => {
  logAccess(req, 'result', req.params.id);
  const result = db.getResult(req.params.id);
  res.json(result);
});
```

**Simplify Conditional:**
```javascript
// Before
if (user.role === 'TEACHER' || user.role === 'ADMIN') {
  return true;
} else {
  return false;
}

// After
const PRIVILEGED_ROLES = ['TEACHER', 'ADMIN'];
return PRIVILEGED_ROLES.includes(user.role);
```

**Extract Interface:**
```javascript
// Before
class ExamController {
  async getExam(req, res) { ... }
  async createExam(req, res) { ... }
  async updateExam(req, res) { ... }
}

// After (Better organization)
class ExamController {
  constructor(examService) {
    this.examService = examService; // Dependency injection
  }
  
  async getExam(req, res) {
    const exam = await this.examService.getExam(req.params.id);
    res.json(exam);
  }
}
```

### 2.2 Dangerous Refactoring (Requires Tests)

**Rewrite Algorithm (if test coverage exists):**
```javascript
// Before: Nested loops, O(n²)
function calculateLeaderboard(results) {
  const sorted = [];
  for (let i = 0; i < results.length; i++) {
    for (let j = 0; j < sorted.length; j++) {
      if (results[i].score > sorted[j].score) {
        sorted.splice(j, 0, results[i]);
        break;
      }
    }
    if (!sorted.includes(results[i])) sorted.push(results[i]);
  }
  return sorted;
}

// After: Built-in sort, O(n log n)
function calculateLeaderboard(results) {
  return [...results].sort((a, b) => b.score - a.score);
}
```

**Change Data Structure (if all tests pass):**
```javascript
// Before: Array iteration for lookup
function findStudent(students, id) {
  for (const student of students) {
    if (student.id === id) return student;
  }
  return null;
}

// After: Map for O(1) lookup
function buildStudentMap(students) {
  return new Map(students.map(s => [s.id, s]));
}

function findStudent(studentMap, id) {
  return studentMap.get(id) || null;
}
```

**Optimize Query (if behavior verified):**
```javascript
// Before: N+1 query
const exams = await prisma.exam.findMany({ where: { institution_id: 1 } });
const examsWithResults = [];
for (const exam of exams) {
  exam.results = await prisma.result.findMany({ where: { exam_id: exam.id } });
  examsWithResults.push(exam);
}

// After: Single query with eager loading
const examsWithResults = await prisma.exam.findMany({
  where: { institution_id: 1 },
  include: { results: true },
});
```

### 2.3 Forbidden Refactoring (NOT Allowed)

**❌ Changing behavior while "refactoring":**
```javascript
// ❌ FORBIDDEN: This changes behavior (score calculation changed)
// Before
function calculateScore(correct, wrong, config) {
  return correct * config.marksPerCorrect - wrong * config.marksPerWrong;
}

// ❌ FORBIDDEN: Now uses different formula
function calculateScore(correct, wrong, config) {
  return (correct * config.marksPerCorrect) / (wrong + 1);
}
```

**❌ Reordering operations that might cause side effects:**
```javascript
// ❌ FORBIDDEN: Moving operation changes behavior
// Before
function submitExam(answers) {
  const score = calculateScore(answers); // Score calculated first
  saveResult(score); // Then saved
  notifyParent(); // Then notify
}

// ❌ FORBIDDEN: Reordering changes timing
function submitExam(answers) {
  notifyParent(); // Notify before save (might reference missing result)
  saveResult(score);
  const score = calculateScore(answers);
}
```

**❌ Removing error handling "for cleanliness":**
```javascript
// ❌ FORBIDDEN: Error handling is important
// Before
try {
  const result = await submitExam(answers);
  return result;
} catch (error) {
  logger.error('Exam submission failed', error);
  throw error;
}

// ❌ FORBIDDEN: Silently ignores errors
function submitExam(answers) {
  return calculateScore(answers);
}
```

**❌ Simplifying logic without understanding implications:**
```javascript
// ❌ FORBIDDEN: Assumes null/undefined handling not needed
// Before
function getExamDuration(exam) {
  if (!exam) return 0;
  if (!exam.duration) return 0;
  return exam.duration;
}

// ❌ FORBIDDEN: Will crash if exam is null
function getExamDuration(exam) {
  return exam.duration;
}
```

---

## 3. Refactoring Workflow

### 3.1 Pre-Refactoring Checklist

Before starting any refactoring:

- [ ] **All tests pass** (run full test suite)
- [ ] **Coverage is adequate** (> 80% for module)
- [ ] **No uncommitted changes** (clean working directory)
- [ ] **Clear objective** (what problem is this solving?)
- [ ] **Risk assessment** (how likely is regression?)
- [ ] **Time-boxed** (won't take more than 2 hours)

### 3.2 Refactoring Steps

**Step 1: Understand Current Behavior**
```javascript
// Run ALL tests for this module
npm test -- ScoreCalculation.test.js

// Study the code
// Understand data flow
// Document current behavior
```

**Step 2: Make One Small Change**
```javascript
// Change ONE thing at a time
// Extract ONE function, or
// Rename ONE variable, or
// Simplify ONE condition

// Do NOT refactor multiple things simultaneously
```

**Step 3: Run Tests**
```javascript
// IMMEDIATELY run tests after each change
npm test -- ScoreCalculation.test.js

// If tests fail, REVERT (git checkout <file>)
// Do not debug the refactoring
```

**Step 4: Commit**
```bash
git add ScoreCalculation.js
git commit -m "refactor: extract calculatePercentage() function"
```

**Step 5: Repeat**
```
For each small change:
  - Make change
  - Run tests
  - Commit
```

### 3.3 Refactoring Commit Messages

**Good Refactoring Commits:**
```
refactor: extract calculateGrade() from processExam()
refactor: rename 'sc' to 'score' for clarity
refactor: consolidate duplicate logging logic
refactor: simplify grade assignment with lookup table
refactor: optimize leaderboard calculation (O(n²) → O(n log n))
refactor: remove unused getOldScore() function
```

**Bad Refactoring Commits:**
```
❌ fix: stuff
❌ update code
❌ cleanup
❌ refactor: fixed bug and renamed things
❌ refactor: major overhaul (too many changes)
```

---

## 4. Code Quality Metrics for Refactoring

### 4.1 Cyclomatic Complexity

**Target:** < 5 per function (strict: < 10)

**High Complexity Example:**
```javascript
function assignGrade(score) {
  if (score > 90) return 'A+';
  else if (score > 85) return 'A';
  else if (score > 80) return 'A-';
  else if (score > 75) return 'B+';
  else if (score > 70) return 'B';
  else if (score > 65) return 'B-';
  // ... 10+ more conditions
}
// Complexity: 12 (way too high)
```

**Refactored (Low Complexity):**
```javascript
const GRADE_SCALE = [
  { min: 90, grade: 'A+' },
  { min: 85, grade: 'A' },
  { min: 80, grade: 'A-' },
  // ...
];

function assignGrade(score) {
  const gradeEntry = GRADE_SCALE.find(g => score >= g.min);
  return gradeEntry?.grade || 'F';
}
// Complexity: 2
```

### 4.2 Function Length

**Target:** < 20 lines (strict: < 30)

**Long Function Example:**
```javascript
function submitExam(req, res) {
  // 50 lines of code
  // Validate input
  // Calculate score
  // Update database
  // Send notification
  // Log audit
  // Return response
}
```

**Refactored:**
```javascript
function submitExam(req, res) {
  validateSubmission(req.body);
  const exam = fetchExam(req.params.exam_id);
  const score = calculateScore(exam);
  updateDatabase(score);
  queueNotification(score);
  logAudit(score);
  return res.json(score);
}
```

### 4.3 Nesting Depth

**Target:** < 3 levels (strict: < 4)

**Deeply Nested Example:**
```javascript
function processResults(results) {
  for (const exam of results) {
    if (exam.status === 'SUBMITTED') {
      for (const student of exam.students) {
        if (student.answers) {
          for (const answer of student.answers) {
            if (answer.selected) {
              // ... code here (4 levels deep)
            }
          }
        }
      }
    }
  }
}
```

**Refactored (Early Return):**
```javascript
function processResults(results) {
  const submittedExams = results.filter(e => e.status === 'SUBMITTED');
  for (const exam of submittedExams) {
    processExamStudents(exam);
  }
}

function processExamStudents(exam) {
  const validStudents = exam.students.filter(s => s.answers);
  for (const student of validStudents) {
    processStudentAnswers(student);
  }
}

function processStudentAnswers(student) {
  const selectedAnswers = student.answers.filter(a => a.selected);
  // Process selected answers
}
```

---

## 5. Refactoring Patterns (Safe & Effective)

### 5.1 Extract Method

**When:** Function is doing too much

```javascript
function calculateResults(exams) {
  // Extract into separate function
  function filterSubmittedExams(exams) {
    return exams.filter(e => e.status === 'SUBMITTED');
  }
  
  function calculateScores(exams) {
    return exams.map(e => ({
      ...e,
      score: calculateScore(e),
    }));
  }
  
  function rankStudents(exams) {
    return exams.sort((a, b) => b.score - a.score);
  }
  
  const submitted = filterSubmittedExams(exams);
  const scored = calculateScores(submitted);
  const ranked = rankStudents(scored);
  return ranked;
}
```

### 5.2 Replace Magic Numbers with Named Constants

**When:** Hard to understand what numbers mean

```javascript
// Before
if (exam.duration < 30) throw new Error('Duration too short');
if (exam.totalMarks > 500) throw new Error('Marks too high');
if (exam.questions.length > 200) throw new Error('Too many questions');

// After
const MIN_EXAM_DURATION = 30;
const MAX_TOTAL_MARKS = 500;
const MAX_QUESTIONS = 200;

if (exam.duration < MIN_EXAM_DURATION) {
  throw new Error('Duration too short');
}
if (exam.totalMarks > MAX_TOTAL_MARKS) {
  throw new Error('Marks too high');
}
if (exam.questions.length > MAX_QUESTIONS) {
  throw new Error('Too many questions');
}
```

### 5.3 Move Responsibility to Appropriate Class

**When:** Code in wrong place

```javascript
// ❌ Before: Business logic in controller
app.post('/api/exams/:id/submit', (req, res) => {
  const answers = req.body.answers;
  const exam = db.getExam(req.params.id);
  const answerKey = db.getAnswerKey(exam.id);
  
  let score = 0;
  for (const [qNum, studentAnswer] of Object.entries(answers)) {
    if (studentAnswer === answerKey[qNum]) {
      score += 4;
    }
  }
  
  db.saveResult({ exam_id: exam.id, score });
  res.json({ score });
});

// ✅ After: Business logic in service
class ScoreCalculationService {
  calculateScore(answers, answerKey, config) {
    let score = 0;
    for (const [qNum, studentAnswer] of Object.entries(answers)) {
      if (studentAnswer === answerKey[qNum]) {
        score += config.marksPerCorrect;
      }
    }
    return score;
  }
}

app.post('/api/exams/:id/submit', (req, res) => {
  const exam = db.getExam(req.params.id);
  const answerKey = db.getAnswerKey(exam.id);
  const score = scoreCalcService.calculateScore(
    req.body.answers,
    answerKey,
    exam.config
  );
  db.saveResult({ exam_id: exam.id, score });
  res.json({ score });
});
```

### 5.4 Replace Conditional with Polymorphism (Advanced)

**When:** Same logic repeated for different types

```javascript
// ❌ Before: Conditional logic repeated
function calculateScore(exam) {
  if (exam.mode === 'DIGITAL_PAPER') {
    // Digital-specific scoring
    return calculateDigitalScore(exam);
  } else if (exam.mode === 'PHYSICAL_PAPER') {
    // Physical-specific scoring
    return calculatePhysicalScore(exam);
  }
}

// ✅ After: Polymorphic approach
class DigitalPaperExam {
  calculateScore() { /* digital-specific */ }
}

class PhysicalPaperExam {
  calculateScore() { /* physical-specific */ }
}

function calculateScore(exam) {
  return exam.calculateScore();
}
```

---

## 6. Automated Refactoring Tools

### 6.1 ESLint + Auto-Fix

```bash
# Fix obvious issues automatically
npx eslint src/ --fix

# Focus on specific rules
npx eslint src/ --fix --rule "no-var:error"
```

### 6.2 Code Formatting with Prettier

```bash
# Format all code
npx prettier --write src/

# Check formatting
npx prettier --check src/
```

### 6.3 Complexity Analysis

```bash
# Install complexity analyzer
npm install --save-dev eslint-plugin-complexity

# Report high-complexity functions
npx eslint src/ --report-unused-disable-directives
```

---

## 7. Refactoring Review Checklist

When reviewing a refactoring PR:

- [ ] **All tests pass** (before and after)
- [ ] **No behavior change** (same input = same output)
- [ ] **Commit messages clear** (one refactoring per commit)
- [ ] **No mixing refactoring + features** (one concern per PR)
- [ ] **Complexity reduced** (cyclomatic, length, nesting)
- [ ] **Readability improved** (better names, clearer flow)
- [ ] **No performance regression** (if anything, improved)
- [ ] **Coverage maintained or improved** (not decreased)
- [ ] **Code style consistent** (matches project standards)
- [ ] **No dead code introduced** (unused variables, functions)

---

## 8. Anti-Patterns to Avoid During Refactoring

### 8.1 Over-Abstraction

```javascript
// ❌ WRONG: Over-engineered for a simple case
class AnimalLegCountDeterminer {
  constructor(legStrategy) {
    this.strategy = legStrategy;
  }
  determine(animal) {
    return this.strategy.getLegCount(animal);
  }
}

// ✅ CORRECT: Keep it simple
function getAnimalLegCount(animal) {
  const legCounts = { dog: 4, bird: 2, spider: 8 };
  return legCounts[animal];
}
```

### 8.2 Premature Optimization

```javascript
// ❌ WRONG: Optimizing before measuring
const memoizedScores = new Map();

function getScore(examId) {
  if (memoizedScores.has(examId)) {
    return memoizedScores.get(examId);
  }
  // ...very complex memoization logic
}

// ✅ CORRECT: Add caching only if needed
function getScore(examId) {
  return db.getScore(examId);
}
// Profile first, optimize only if slow
```

### 8.3 Changing Too Much at Once

```javascript
// ❌ WRONG: 5 different refactorings in one commit
git commit -m "refactor: extract functions, rename vars, optimize queries, simplify conditionals, reorder classes"

// ✅ CORRECT: One refactoring per commit
git commit -m "refactor: extract calculateGrade() function"
git commit -m "refactor: rename 'sc' to 'score'"
git commit -m "refactor: optimize exam query with index"
```

---

## 9. Refactoring Sign-Off

This document defines the mandatory refactoring protocol for EduOMR.

**No refactoring is accepted without:**
1. ✅ All tests passing (before and after)
2. ✅ No behavior change (same input = same output)
3. ✅ Clear, single-purpose commits
4. ✅ Reduced complexity (verifiable)
5. ✅ Improved readability
6. ✅ No performance regression
7. ✅ Coverage maintained

---

## Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-13 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved after review — Prisma alignment confirmed, safety levels validated |

---

## Approval Sign-Off

**Document:** DOC 0.8 — AI Refactoring Prompt  
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Architect | opencode | 2026-07-14 | ✅ Approved |

---

**Next:** After approval, proceed to DOC 0.9 — AI Architecture Reviewer
