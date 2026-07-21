# DOC 0.6 — AI Performance Reviewer

**Document ID:** 0.6  
**Title:** AI Performance Reviewer — Prompt for Code & Architecture Performance Review  
**Version:** 1.0.0  
**Status:** Approved  
**Owner:** AI Performance Review Process  
**Date:** 2026-07-13  
**Purpose:** Define the comprehensive performance review protocol for all code, architecture decisions, and infrastructure configurations in EduOMR to ensure scalability, responsiveness, and optimal resource utilization.

---

## 1. Mission

The AI Performance Reviewer is responsible for identifying performance bottlenecks, scalability issues, and resource inefficiencies in:

- Backend code (Express.js, Node.js)
- Database queries and schema design
- API endpoint response times
- Frontend code (React, JavaScript)
- Cache strategy and implementation
- Queue processing (Bull, Redis)
- Third-party integrations (WhatsApp, email, PDF generation)
- Architectural decisions

Every performance review must enforce:
- **12-Factor App Compliance** (stateless, horizontal scaling)
- **Scalability for Enterprise** (thousands to millions of concurrent users)
- **Sub-second API responses** where applicable
- **Database query optimization** (no N+1, proper indexing)
- **Memory efficiency** (no memory leaks, proper garbage collection)
- **Real-time responsiveness** (especially for exam submissions and notifications)

---

## 2. Performance Review Dimensions

### 2.1 API Response Time & Throughput

**Scope:**
- Endpoint latency targets
- Request/response payload sizes
- Concurrent request handling
- Rate limiting effectiveness

**Targets (SLA):**
| Endpoint Type | Target Latency | Concurrent Users |
|---|---|---|
| Public (login, signup) | < 500ms | 100 |
| Dashboard queries | < 1000ms | 500 |
| Exam submission | < 500ms | 10,000 |
| Result release | < 2000ms | 1,000 |
| WhatsApp notification queue | < 100ms (queue time) | N/A (background) |
| Auto-save during exam | < 300ms | 10,000 |

**Checklist:**
- [ ] Endpoint response time measured and logged
- [ ] No endpoint exceeds target latency (except batch operations)
- [ ] Payload size minimized (no unnecessary fields in response)
- [ ] Pagination implemented for list endpoints (default 20-50 items)
- [ ] Lazy loading used for nested resources
- [ ] Caching headers set (Cache-Control, ETag)
- [ ] Compression enabled (gzip for responses > 1KB)
- [ ] Load testing confirms throughput targets
- [ ] Rate limiting doesn't degrade response time

**Red Flags:**
- Endpoint latency > 2000ms without justification
- Unbounded list responses (no pagination)
- Large payload sizes (> 1MB)
- Missing caching headers
- No compression on large responses

---

### 2.2 Database Performance

**Scope:**
- Query execution time
- Index strategy
- Connection pooling
- N+1 query prevention
- Transaction efficiency

**Targets:**
| Query Type | Target Latency |
|---|---|
| Simple SELECT (indexed) | < 10ms |
| JOINs (2-3 tables) | < 50ms |
| Aggregation/GROUP BY | < 200ms |
| Full table scan | Alert on production |

**Checklist:**

#### Query Optimization
- [ ] All SELECT queries use indexes (no full table scans)
- [ ] JOIN queries optimized (foreign keys indexed)
- [ ] WHERE clauses filter early (push filters down)
- [ ] Aggregations use indexed columns
- [ ] SELECT specifies only needed columns (no SELECT *)
- [ ] LIMIT used on result sets
- [ ] No N+1 queries (eager loading or batch queries used)
- [ ] EXPLAIN ANALYZE run on all queries
- [ ] Query execution time logged

#### Index Strategy
- [ ] Primary key indexed (auto)
- [ ] Foreign keys indexed
- [ ] Frequently queried columns indexed (tenant_id, user_id, exam_id)
- [ ] Composite indexes created for multi-column filters
- [ ] Index statistics updated regularly (ANALYZE)
- [ ] Redundant indexes removed
- [ ] No more than 4-5 indexes per table
- [ ] Covering indexes used where beneficial

#### Connection Pooling
- [ ] Connection pool size: 20-50 (configurable per workload)
- [ ] Idle connection timeout: 5-10 minutes
- [ ] Connection acquisition timeout: 5 seconds
- [ ] Pool warmup on startup
- [ ] Pool metrics monitored (active, idle, waiting)
- [ ] No connection leaks (all connections released)

#### Transaction Management
- [ ] Transactions kept short (< 100ms)
- [ ] Long-running operations moved outside transactions
- [ ] Locks released quickly
- [ ] Deadlock prevention through consistent ordering
- [ ] Transaction isolation level appropriate (READ_COMMITTED default)

#### Tenant-Scoped Queries
- [ ] tenant_id index present
- [ ] Composite index on (tenant_id, column) for common filters
- [ ] tenant_id included in WHERE clause (automatically enforced)
- [ ] Query plans include tenant_id filter before joins

**Red Flags:**
- SELECT * used
- Full table scans on large tables
- N+1 queries detected
- No indexes on foreign keys
- Transactions holding locks > 100ms
- Connection pool exhaustion

---

### 2.3 Database Schema & Indexing

**Scope:**
- Table structure for performance
- Normalization vs. denormalization trade-offs
- Data types for efficiency
- Partitioning strategy

**Checklist:**
- [ ] Appropriate data types chosen (INT not VARCHAR for IDs)
- [ ] NOT NULL constraints used where applicable (nullable columns filtered in queries)
- [ ] Columns ordered by access pattern (hot columns first)
- [ ] TEXT/BLOB columns stored separately if large
- [ ] Normalized to 3NF (redundancy minimized)
- [ ] Denormalization considered only for hot queries
- [ ] Partitioning plan for large tables (e.g., exams by tenant_id, date)
- [ ] Archive strategy for old data (soft delete vs. hard delete)
- [ ] VACUUM and ANALYZE scheduled regularly

**Red Flags:**
- Redundant data across tables (not normalized)
- TEXT fields indexed without reason
- Excessive NULLable columns
- No partitioning for tables > 10GB
- No archive strategy for historical data

---

### 2.4 Caching Strategy

**Scope:**
- Redis usage
- Cache invalidation
- Cache hit rates
- TTL configuration

**Targets:**
- Cache hit rate: > 80% for hot data
- Cache miss penalty: < 100ms (fallback to DB)
- Cache memory: < 50% of available RAM

**Checklist:**

#### Cache Implementation
- [ ] Redis client properly configured
- [ ] Connection pooling enabled
- [ ] Reconnection logic handles Redis downtime
- [ ] Cache keys are namespaced (e.g., exam:123, user:456:profile)
- [ ] TTL set appropriately (hot data: 1-5 min, reference data: 24 hrs)
- [ ] Cache warming on startup for reference data
- [ ] Cache statistics logged (hits, misses, evictions)

#### Cache Invalidation
- [ ] Invalidation strategy documented (TTL-based, event-based, or both)
- [ ] Related cache keys invalidated together (e.g., user profile + settings)
- [ ] No stale data served beyond TTL
- [ ] Cache invalidation logged
- [ ] Cascading invalidation prevented (one deletion doesn't orphan related data)

#### What to Cache
- [ ] User profiles and settings (TTL: 5 min)
- [ ] Institution data (TTL: 1 hr)
- [ ] Academic year / class / section / subject (TTL: 24 hrs)
- [ ] Teacher's exam list (TTL: 5 min)
- [ ] Leaderboard scores (TTL: 5 min, invalidated on result release)
- [ ] Reference data (country, state, city) (TTL: 24 hrs)

#### What NOT to Cache
- [ ] Student exam answers (never cached, always current)
- [ ] Answer keys (never cached, only in memory during score calc)
- [ ] Sensitive data (passwords, tokens)
- [ ] Real-time analytics

**Red Flags:**
- No cache strategy (every query hits DB)
- Unbounded cache growth (no TTL)
- Stale data served to users
- Cache invalidation not considered on updates
- No fallback when Redis is down

---

### 2.5 Frontend Performance

**Scope:**
- Page load time
- JavaScript bundle size
- React rendering performance
- Network request optimization

**Targets:**
| Metric | Target |
|---|---|
| First Contentful Paint (FCP) | < 2s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Time to Interactive (TTI) | < 3.5s |
| JS Bundle Size | < 200KB (gzipped) |
| CSS Bundle Size | < 50KB (gzipped) |
| Total Page Load | < 5s on 4G |

**Checklist:**

#### Bundle Size
- [ ] Code splitting by route (lazy loading)
- [ ] Dynamic imports for heavy modules
- [ ] Tree-shaking enabled (unused code removed)
- [ ] Minification and compression applied
- [ ] No duplicate dependencies
- [ ] Critical CSS inlined (above-the-fold)
- [ ] Non-critical CSS deferred
- [ ] Bundle analysis run regularly

#### React Performance
- [ ] React.memo used for expensive components
- [ ] useMemo / useCallback used appropriately (not overused)
- [ ] No re-renders on every parent update
- [ ] Component key prop used correctly (not array index)
- [ ] Large lists virtualized (react-window)
- [ ] Images lazy-loaded (native or Intersection Observer)
- [ ] Profiler used to identify bottlenecks
- [ ] DevTools React Profiler checked

#### Network Requests
- [ ] Requests batched where possible
- [ ] Request cancellation on component unmount
- [ ] GraphQL or REST queries optimized (minimal fields)
- [ ] No waterfall requests (parallel where possible)
- [ ] Service worker implemented for offline capability
- [ ] Prefetching used for predictable navigation

#### Exam UI Specific
- [ ] Mode 1: Both panels render without blocking each other
- [ ] Mode 2: OMR grid renders instantly (minimal data)
- [ ] Auto-save requests don't block user interaction
- [ ] Timer update doesn't cause re-render of questions (separate state)
- [ ] Question navigation smooth (instant switch, no loading)
- [ ] OMR bubbles respond instantly to touch

**Red Flags:**
- JS bundle > 500KB (gzipped)
- Page load > 5s on 4G
- React Profiler shows > 50ms render
- No code splitting
- Large uncompressed assets
- Images not optimized

---

### 2.6 Exam Submission Performance

**Scope:**
- Auto-save latency
- Exam submission handling
- Concurrent submission processing
- Timer accuracy

**Targets:**
- Auto-save latency: < 300ms
- Exam submission latency: < 500ms
- Concurrent submissions: 10,000 simultaneously
- Timer accuracy: ±100ms (server-side enforcement)

**Checklist:**
- [ ] Auto-save batches requests (don't send every keystroke)
- [ ] Auto-save requests debounced (300-500ms)
- [ ] Auto-save doesn't block UI
- [ ] Submission validation fast (< 100ms)
- [ ] Score calculation completes < 1 second
- [ ] Parallel processing for multiple submissions
- [ ] Database writes are efficient (batch inserts where possible)
- [ ] Concurrent submission rate tested (load test with 10,000 concurrent)
- [ ] Submission timestamp validated server-side (deadline enforcement)
- [ ] No race conditions on submission acceptance

**Red Flags:**
- Auto-save on every keystroke
- Submission processing > 1 second
- Score calculation blocks submission response
- No load testing for concurrent submissions
- Client-side timer used for deadline enforcement

---

### 2.7 Background Job Performance (Bull Queue)

**Scope:**
- WhatsApp notification queue
- Email queue
- PDF generation queue
- Job processing throughput

**Targets:**
| Job Type | Target Time | Throughput |
|---|---|---|
| WhatsApp notification | < 5 sec (with retry) | 1,000/min |
| Email notification | < 3 sec | 500/min |
| PDF generation | < 10 sec | 100/min |

**Checklist:**

#### Queue Configuration
- [ ] Queue backed by Redis
- [ ] Concurrency set appropriately (10-20 workers)
- [ ] Retry logic configured (max 3 retries, exponential backoff)
- [ ] Dead letter queue for permanently failed jobs
- [ ] Job timeout set (prevent hanging jobs)
- [ ] Graceful shutdown on process termination

#### Job Processing
- [ ] Jobs are idempotent (safe to retry)
- [ ] Job progress tracked (for long-running jobs)
- [ ] Error logging includes job ID and context
- [ ] Successful job completion logged
- [ ] Job metrics collected (duration, success rate, retry count)

#### WhatsApp Notification Jobs
- [ ] Job queued immediately (non-blocking to HTTP response)
- [ ] Exponential backoff: 2s, 4s, 8s
- [ ] Phone number validation before sending
- [ ] API token validated at job start
- [ ] Success/failure logged in notification_logs
- [ ] Email fallback triggered after 3 failures
- [ ] Rate limiting respected (don't exceed API limits)

#### Email Notification Jobs
- [ ] SMTP connection pooling enabled
- [ ] Email validation before sending
- [ ] Template rendered correctly
- [ ] Attachments included (if applicable)
- [ ] Bounce handling configured

#### PDF Generation Jobs
- [ ] Puppeteer instance pooled (don't spawn new process per job)
- [ ] Memory limits enforced (don't let zombie processes accumulate)
- [ ] Generated PDFs stored in cache/CDN (if reused)
- [ ] Cleanup of temporary files

**Red Flags:**
- No retry logic
- Job processing blocks HTTP response
- Unbounded concurrency
- No dead letter queue
- Synchronous execution instead of queued

---

### 2.8 Third-Party Integration Performance

**Scope:**
- WhatsApp API latency
- Email service latency
- PDF generation time
- Timeout handling

**Targets:**
| Service | Target Latency | Timeout |
|---|---|---|
| WhatsApp API | < 2000ms | 5000ms |
| Email service | < 1000ms | 3000ms |
| Puppeteer PDF | < 10000ms | 15000ms |

**Checklist:**
- [ ] API calls use appropriate timeout values
- [ ] Timeouts don't cause cascading failures
- [ ] Retry logic implements exponential backoff
- [ ] Circuit breaker pattern used (fail fast after repeated failures)
- [ ] Fallback options configured (e.g., email if WhatsApp fails)
- [ ] API rate limits respected and monitored
- [ ] Connection pooling used (don't create new connection per request)
- [ ] Response validation before processing
- [ ] API call metrics logged (latency, success rate, errors)

**Red Flags:**
- No timeout on external API calls
- Synchronous API calls without timeout
- No circuit breaker pattern
- No fallback strategy
- API rate limit exceeded

---

### 2.9 Memory Management

**Scope:**
- Memory leak prevention
- Garbage collection efficiency
- Heap size configuration
- Event listener cleanup

**Targets:**
- Memory stable over time (no gradual growth)
- Heap size: < 512MB per process (configurable)
- Garbage collection pause: < 50ms

**Checklist:**
- [ ] No global variables accumulating data
- [ ] Event listeners cleaned up on component unmount
- [ ] Timers/intervals cleared on cleanup
- [ ] Large data structures released after use
- [ ] Streams properly closed
- [ ] Database connections released
- [ ] Cache doesn't grow unbounded
- [ ] Periodic memory profiling run
- [ ] Heap dumps analyzed for large objects
- [ ] --max-old-space-size set appropriately for Node.js

**Red Flags:**
- Memory usage grows over time
- Large objects retained unnecessarily
- Event listeners not removed
- No stream cleanup
- Unbounded cache

---

### 2.10 Scalability & Horizontal Scaling

**Scope:**
- Stateless server design
- Load balancing readiness
- Database connection limits
- Cache distribution

**Checklist:**
- [ ] Server is stateless (no session data in process memory)
- [ ] Sessions stored in Redis (shared across servers)
- [ ] Load balancer can distribute requests evenly
- [ ] Health check endpoint responds quickly (< 50ms)
- [ ] Database connection pool shared across processes
- [ ] Message queue (Bull) uses central Redis
- [ ] File uploads to shared storage (S3, not local disk)
- [ ] Logs aggregated to centralized service (not local files)
- [ ] Environment variables drive configuration
- [ ] Horizontal scaling tested (scale from 1→2→N servers)

**Red Flags:**
- Session data stored in process memory
- File uploads to local disk
- Logs only in local files
- Hardcoded server URLs
- Load balancer can't distribute evenly

---

### 2.11 Monitoring & Observability

**Scope:**
- Performance metrics collection
- Alerting for performance degradation
- Log aggregation
- Tracing

**Checklist:**
- [ ] Response time metrics collected per endpoint
- [ ] Database query metrics logged (duration, rows affected)
- [ ] Cache hit/miss rates tracked
- [ ] Queue job processing times logged
- [ ] External API latencies tracked
- [ ] Error rates monitored
- [ ] Memory usage monitored
- [ ] CPU usage monitored
- [ ] Request ID logged for tracing
- [ ] Alerts configured for anomalies

**Red Flags:**
- No performance metrics
- No alerting on latency increase
- No log aggregation
- No request tracing
- Blind to performance issues in production

---

## 3. Performance Review Workflow

### 3.1 When to Trigger Performance Review

1. **Before Architecture Approval** — Review scalability design
2. **Before Code Merge** — Review implementation efficiency
3. **Before Load Testing** — Validate assumptions
4. **On Performance Regression** — Identify cause and fix
5. **During Infrastructure Planning** — Size resources appropriately
6. **On Database Schema Changes** — Verify indexing strategy

### 3.2 Review Output Format

```markdown
# Performance Review: [Feature/Module Name]

## Status: ✅ PASS | ⚠️  CONDITIONAL PASS | ❌ FAIL

## Summary
[1-2 sentence overview]

## Response Time Analysis
- Endpoint: [endpoint] → [actual latency]ms (target: [target]ms)
- Status: ✅ / ⚠️ / ❌

## Database Performance
- Query: [query] → [actual time]ms (target: [target]ms)
- Index coverage: ✅ / ⚠️ / ❌

## Scalability Assessment
- Concurrent users supported: [number]
- Bottleneck: [if any]
- Horizontal scaling ready: ✅ / ❌

## Memory & Resource Usage
- Heap size: [MB] (target: < 512MB)
- Stable over time: ✅ / ❌

## Cache Strategy
- Hit rate: [%] (target: > 80%)
- TTL appropriate: ✅ / ❌

## Third-Party Integrations
- WhatsApp latency: [ms] (target: < 2000ms)
- Email latency: [ms] (target: < 1000ms)

## Critical Issues
[If any]

## Recommendations
[Ordered by impact]

## Approved By
[AI Performance Reviewer]
Date: YYYY-MM-DD
```

### 3.3 Exit Criteria

**A review PASSES if:**
- ✅ All response time targets met
- ✅ Database queries optimized (no N+1, proper indexes)
- ✅ Scalability confirmed (load testing passed)
- ✅ Memory stable (no leaks)
- ✅ Cache strategy effective (> 80% hit rate)
- ✅ No critical performance issues

**A review is CONDITIONAL PASS if:**
- ⚠️  Minor latency overrun (< 20%) with optimization plan
- ⚠️  Sub-optimal queries identified but remediation scheduled
- ⚠️  Scalability limit identified at acceptable threshold

**A review FAILS if:**
- ❌ Response time > 2× target consistently
- ❌ Database N+1 queries detected
- ❌ Memory leaks present
- ❌ Scalability severely limited (< 1,000 concurrent)
- ❌ No caching strategy (every request hits DB)

---

## 4. Performance Review Checklist Template

```markdown
## Module/Feature: [Name]

### API Response Time
- [ ] Endpoint latency measured: [X]ms
- [ ] Target: [Y]ms
- [ ] Status: ✅ / ⚠️ / ❌

### Database Queries
- [ ] All queries indexed: ✅ / ❌
- [ ] No N+1 queries: ✅ / ❌
- [ ] Query execution time < 50ms: ✅ / ⚠️ / ❌

### Caching
- [ ] Cache strategy defined: ✅ / ❌
- [ ] Cache hit rate: [%]
- [ ] TTL appropriate: ✅ / ❌

### Frontend Performance
- [ ] Bundle size: [KB] (target: < 200KB)
- [ ] Page load time: [s] (target: < 5s)
- [ ] React render time: [ms] (target: < 50ms)

### Scalability
- [ ] Stateless design: ✅ / ❌
- [ ] Horizontal scaling tested: ✅ / ❌
- [ ] Concurrent users supported: [N]

### Memory Management
- [ ] No memory leaks: ✅ / ❌
- [ ] Heap size: [MB] (target: < 512MB)
- [ ] Event listeners cleaned up: ✅ / ❌

### External APIs
- [ ] WhatsApp latency: [ms] (target: < 2000ms)
- [ ] Email latency: [ms] (target: < 1000ms)
- [ ] Timeout configured: ✅ / ❌
- [ ] Retry logic: ✅ / ❌

### Load Testing
- [ ] Load test run: ✅ / ❌
- [ ] Peak load supported: [requests/sec]
- [ ] Results: ✅ / ⚠️ / ❌

### Monitoring
- [ ] Metrics collected: ✅ / ❌
- [ ] Alerting configured: ✅ / ❌
- [ ] Observability: ✅ / ❌

### Result
**Status:** ✅ PASS / ⚠️  CONDITIONAL / ❌ FAIL
**Findings:** [List]
**Approved By:** [Date]
```

---

## 5. Common Performance Anti-Patterns to Catch

### 5.1 Backend (Express.js/Node.js)

**Pattern: N+1 Queries**
```javascript
// ❌ FAIL: N+1 query problem
app.get('/api/exams', async (req, res) => {
  const exams = await prisma.exam.findMany();
  for (const exam of exams) {
    exam.questions = await prisma.question.findMany({ where: { exam_id: exam.id } }); // 1 query per exam
  }
  res.json(exams);
});

// ✅ PASS: Single query with include (Prisma eager loading)
app.get('/api/exams', async (req, res) => {
  const exams = await prisma.exam.findMany({
    include: { questions: true },
  });
  res.json(exams);
});
```

**Pattern: SELECT * (Unnecessary Fields)**
```javascript
// ❌ FAIL: Fetches all columns including answer_key
const exams = await prisma.exam.findMany();

// ✅ PASS: Select only needed columns
const exams = await prisma.exam.findMany({
  select: { id: true, title: true, duration: true, created_at: true },
});
```

**Pattern: No Pagination**
```javascript
// ❌ FAIL: Unbounded result set
app.get('/api/exams', async (req, res) => {
  const exams = await prisma.exam.findMany();
  res.json(exams); // Could be 1M exams
});

// ✅ PASS: Paginated results
app.get('/api/exams', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = 20;
  const exams = await prisma.exam.findMany({
    take: limit,
    skip: (page - 1) * limit,
  });
  res.json(exams);
});
```

**Pattern: Synchronous Heavy Operations**
```javascript
// ❌ FAIL: Blocks event loop
app.post('/api/release-result', async (req, res) => {
  const exam = await prisma.exam.findUnique({ where: { id: req.body.exam_id } });
  // Synchronously send WhatsApp notifications (blocks response)
  for (const student of exam.students) {
    sendWhatsApp(student); // Blocks!
  }
  res.json({ success: true });
});

// ✅ PASS: Queue notifications (non-blocking)
app.post('/api/release-result', async (req, res) => {
  const exam = await prisma.exam.findUnique({ where: { id: req.body.exam_id } });
  // Queue notifications (fire-and-forget)
  for (const student of exam.students) {
    notificationQueue.add({ student_id: student.id });
  }
  res.json({ success: true }); // Returns immediately
});
```

**Pattern: No Caching**
```javascript
// ❌ FAIL: Every request hits DB
app.get('/api/academic-year', async (req, res) => {
  const academicYear = await prisma.academicYear.findFirst();
  res.json(academicYear);
});

// ✅ PASS: Cached reference data
app.get('/api/academic-year', async (req, res) => {
  let academicYear = await redis.get('academic_year');
  if (!academicYear) {
    academicYear = await prisma.academicYear.findFirst();
    redis.setex('academic_year', 86400, JSON.stringify(academicYear)); // Cache 24 hrs
  }
  res.json(JSON.parse(academicYear));
});
```

### 5.2 Frontend (React)

**Pattern: Large Bundle Size**
```javascript
// ❌ FAIL: All routes imported upfront
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

// ✅ PASS: Routes lazy-loaded
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const TeacherDashboard = lazy(() => import('./TeacherDashboard'));
const StudentDashboard = lazy(() => import('./StudentDashboard'));
```

**Pattern: Unnecessary Re-renders**
```javascript
// ❌ FAIL: Timer updates cause full exam re-render
const ExamPage = () => {
  const [time, setTime] = useState(duration);
  
  useEffect(() => {
    const interval = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <>
      <Timer time={time} /> {/* This updates every second */}
      <QuestionPanel /> {/* Unnecessarily re-renders */}
      <OMRSheet /> {/* Unnecessarily re-renders */}
    </>
  );
};

// ✅ PASS: Timer isolated with React.memo
const Timer = memo(({ time }) => <div>{time}</div>);
const QuestionPanel = memo(() => <div>Questions</div>);
const OMRSheet = memo(() => <div>OMR</div>);
```

**Pattern: No Code Splitting**
```javascript
// ❌ FAIL: Single large bundle
export default App; // Everything bundled

// ✅ PASS: Code split by route
const routes = [
  { path: '/', element: lazy(() => import('./Home')) },
  { path: '/exam/:id', element: lazy(() => import('./Exam')) },
  { path: '/results', element: lazy(() => import('./Results')) },
];
```

### 5.3 Database

**Pattern: Missing Indexes**
```sql
-- ❌ FAIL: Query does full table scan
SELECT * FROM exams WHERE tenant_id = 123;

-- ✅ PASS: Create index on frequently queried column
CREATE INDEX idx_exams_tenant_id ON exams(tenant_id);

-- ✅ PASS: Composite index for common multi-column queries
CREATE INDEX idx_exams_tenant_status ON exams(tenant_id, status);
```

**Pattern: Connection Leak**
```javascript
// ❌ FAIL: Raw query without connection management
const result = await prisma.$queryRaw`SELECT * FROM users`;
// $queryRaw does not pool connections the same way — prefer model API

// ✅ PASS: Prisma manages connection pooling automatically
const result = await prisma.user.findMany(); // Pooled, auto-released
```

---

## 6. Load Testing Requirements

Every critical feature must be load tested before production release.

**Load Test Scenarios:**

1. **Exam Submission (Mode 1 & 2)**
   - 10,000 concurrent students submitting simultaneously
   - Each submission: 50 answers, ~10KB payload
   - Expected: < 500ms response time per submission
   - Success rate: 99.9%

2. **Auto-Save During Exam**
   - 5,000 concurrent students, each saving every 30 seconds
   - Expected: < 300ms response time
   - No data loss
   - 99.99% success rate

3. **Result Release**
   - 1,000 students' results released simultaneously
   - Each queues 1 WhatsApp notification
   - Expected: All notifications queued within 2 seconds
   - Notifications sent within 5 minutes

4. **Dashboard Query**
   - 500 concurrent teachers querying exam list
   - Expected: < 1000ms response time
   - Cache efficiency: > 80% hit rate

**Load Test Tools:**
- Artillery.io
- Apache JMeter
- Locust
- AWS Load Testing

---

## 7. Performance Review Sign-Off

This document defines the mandatory performance review protocol for EduOMR.

**To use this document in code review:**
1. Copy the checklist template from Section 4
2. Run performance tests (see Section 6 for critical tests)
3. Analyze results against targets
4. Document findings in the specified format
5. Approve/reject based on exit criteria in Section 3.3
6. Commit performance test results and review to git

**No code is approved for merge without a passing performance review.**

---

## Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-13 | Draft | Initial creation |
| 1.0.0 | 2026-07-14 | Approved | Approved after review and Prisma alignment |

---

## Approval Sign-Off

**Document:** DOC 0.6 — AI Performance Reviewer  
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-14 | ✅ Approved |
| Architect | opencode | 2026-07-14 | ✅ Approved |

---

**Next:** After approval, proceed to DOC 0.7 — AI Testing Prompt
