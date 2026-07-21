# DOC 2.8 — DevOps Plan

**Document ID:** 2.8
**Title:** DevOps Plan — CI/CD, Monitoring, Incident Response, Operations Runbook
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Engineering
**Date:** 2026-07-15
**Purpose:** Define the complete DevOps operational plan — CI/CD pipeline operations, monitoring, incident response runbook, database operations, and on-call procedures.

---

## 1. DevOps Principles

| Principle | Guideline |
|---|---|
| Automation First | Every manual task is a candidate for automation |
| Observability | Know system health before users report issues |
| Immutable Artifacts | Same artifact promoted through environments |
| No Secrets in Code | All secrets in environment / secrets manager |
| Blameless Culture | Incidents are system failures, not people failures |
| Documentation | Runbooks for every operational procedure |

---

## 2. CI/CD Pipeline Operations

### 2.1 Pipeline Architecture

```
Git Push → GitHub Actions → Build → Test → Package → Deploy
                │              │        │         │
           Lint, Audit    Docker Build  Jest    Push to ECR/DO
                           Prisma Gen            Container Registry
```

### 2.2 GitHub Actions Workflow (Full)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  DOCKER_REGISTRY: ${{ secrets.DOCKER_REGISTRY }}

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm audit --audit-level=high
      - run: npx sonar-scanner
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  test:
    name: Test
    needs: quality
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: eduomr_test
          POSTGRES_USER: eduomr
          POSTGRES_PASSWORD: testpass
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://eduomr:testpass@localhost:5432/eduomr_test
      - run: npm run test:ci
        env:
          DATABASE_URL: postgresql://eduomr:testpass@localhost:5432/eduomr_test
          REDIS_URL: redis://localhost:6379
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  build:
    name: Build & Push
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t ${{ env.DOCKER_REGISTRY }}/eduomr-api:${{ github.sha }} .
      - run: docker push ${{ env.DOCKER_REGISTRY }}/eduomr-api:${{ github.sha }}
      - run: docker tag ${{ env.DOCKER_REGISTRY }}/eduomr-api:${{ github.sha }} ${{ env.DOCKER_REGISTRY }}/eduomr-api:latest
      - run: docker push ${{ env.DOCKER_REGISTRY }}/eduomr-api:latest

  deploy-staging:
    name: Deploy Staging
    needs: build
    environment: staging
    runs-on: ubuntu-latest
    steps:
      - uses: digitalocean/app_action@v1
        with:
          app_name: eduomr-staging
          token: ${{ secrets.DO_API_TOKEN }}
          image: ${{ env.DOCKER_REGISTRY }}/eduomr-api:${{ github.sha }}

  deploy-production:
    name: Deploy Production
    needs: deploy-staging
    environment: production
    runs-on: ubuntu-latest
    steps:
      - uses: digitalocean/app_action@v1
        with:
          app_name: eduomr-production
          token: ${{ secrets.DO_API_TOKEN }}
          image: ${{ env.DOCKER_REGISTRY }}/eduomr-api:${{ github.sha }}
```

### 2.3 Environment Configuration

```yaml
# .env.example
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1
REQUEST_ID_PREFIX=req_

# Database
DATABASE_URL=postgresql://user:pass@host:5432/eduomr
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://user:pass@host:6379
REDIS_PREFIX=eduomr:

# JWT
JWT_SECRET=512-bit-random-secret
JWT_EXPIRY_SECONDS=900
REFRESH_TOKEN_EXPIRY_SECONDS=604800

# Bcrypt
BCRYPT_ROUNDS=12

# WhatsApp (Meta Cloud API)
META_APP_ID=app_id
META_APP_SECRET=app_secret
META_PHONE_NUMBER_ID=phone_number_id
META_WEBHOOK_TOKEN=webhook_token
META_API_VERSION=v18.0

# Email (SendGrid)
SENDGRID_API_KEY=sg_key
FROM_EMAIL=noreply@eduomr.com

# Bull Queue
BULL_PREFIX=eduomr:bull
BULL_REDIS_URL=redis://user:pass@host:6379

# Rate Limits
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
AUTH_RATE_LIMIT_MAX=10
ANSWER_RATE_LIMIT_MAX=60
```

---

## 3. Monitoring Stack

### 3.1 Dashboard Layout (Grafana)

```
┌─────────────────────────────────────────────────────┐
│  SERVICE HEALTH           │  BUSINESS METRICS        │
│  ┌────────────────────┐   │  ┌────────────────────┐  │
│  │ API Uptime: 99.97%  │   │  Exams Today: 23    │  │
│  │ p95 Latency: 320ms  │   │  Active Sessions: 145│  │
│  │ Error Rate: 0.8%    │   │  Avg Score: 67.4%   │  │
│  └────────────────────┘   │  └────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  TOP 5 SLOW ENDPOINTS     │  DATABASE                │
│  /exams/analytics  2.1s   │  Connections: 12/200    │
│  /leaderboard      1.8s   │  Cache Hit: 89%         │
│  /results/release  950ms  │  Replication Lag: 0ms   │
├─────────────────────────────────────────────────────┤
│  RECENT ERRORS (Last 15 min)                        │
│  10:32: ExamNotFound — teacher-requested deleted    │
│  10:28: RateLimitExceeded — student IP 192.x.x.x    │
│  10:15: WhatsAppAPIError — token expired            │
└─────────────────────────────────────────────────────┘
```

### 3.2 Log Aggregation

| Tool | Purpose |
|---|---|
| Winston (app) | Structured JSON logs to stdout |
| CloudWatch / DO Logs | Log collection + retention |
| Grafana Loki | Log querying (alternative to CloudWatch) |

### 3.3 Alerting Channels

| Severity | Channel | Response SLA |
|---|---|---|
| Critical | PagerDuty push + SMS | 15 min |
| High | Slack #eduomr-alerts | 30 min |
| Medium | Slack #eduomr-team | 4 hours |
| Low | Email digest (daily) | 24 hours |

### 3.4 Alert Rules

```json
{
  "alerts": [
    {
      "name": "High Error Rate",
      "condition": "error_rate > 5% for 5 minutes",
      "severity": "critical"
    },
    {
      "name": "High Latency",
      "condition": "p95_latency > 2000ms for 5 minutes",
      "severity": "high"
    },
    {
      "name": "Database Connections",
      "condition": "db_connections > 150",
      "severity": "high"
    },
    {
      "name": "Queue Dead Letter",
      "condition": "dead_letter_count > 10",
      "severity": "high"
    },
    {
      "name": "Certificate Expiry",
      "condition": "days_until_expiry < 30",
      "severity": "medium"
    },
    {
      "name": "Disk Usage",
      "condition": "disk_usage > 80%",
      "severity": "medium"
    }
  ]
}
```

---

## 4. Incident Response Runbook

### 4.1 Incident Severity Levels

| Level | Definition | Examples |
|---|---|---|
| SEV-1 | Service down, data loss, security breach | DB crash, exam data corrupted |
| SEV-2 | Major feature unavailable, degraded performance | Auto-save failing, slow login |
| SEV-3 | Minor feature issue, cosmetic | Dashboard chart wrong, typo |

### 4.2 SEV-1 Incident Response

```
TIMELINE:
┌──────────┐
│ T+0 min  │ Alert triggered (PagerDuty)
├──────────┤
│ T+5 min  │ Engineer acknowledges
├──────────┤
│ T+15 min │ Initial assessment: what, scope, impact
├──────────┤
│ T+30 min │ Fix applied OR decision to rollback
├──────────┤
│ T+45 min │ Verification: smoke tests pass, metrics green
├──────────┤
│ T+60 min │ Post-mortem initiated
└──────────┘
```

### 4.3 Incident Response Checklist

```markdown
## SEV-1 Incident Checklist

### Immediate (< 5 min)
1. Acknowledge alert
2. Join #eduomr-incident Slack channel
3. Announce: "[SEV-1] Issue: {summary}, Impact: {scope}"

### Assessment (5-15 min)
4. Check Grafana dashboard: error rate, latency, DB connections
5. Check recent deployments (last 30 min)
6. Check logs for error patterns
7. Determine: code issue vs infrastructure vs data issue

### Resolution (15-45 min)
8. If code issue: rollback to previous working version
9. If DB issue: check replication, connections, slow queries
10. If infrastructure: scale, restart, or failover

### Recovery (45-60 min)
11. Verify all metrics returning to baseline
12. Run smoke tests
13. Announce: "[SEV-1] Resolved. Root cause: {cause}"
14. Schedule post-mortem (within 24 hours)
```

---

## 5. Database Operations

### 5.1 Migration Runbook

```markdown
## Database Migration Procedure

### Pre-Migration (1 day before)
1. Notify team: "Migration scheduled for {date} at {time}"
2. Create manual DB snapshot
3. Run migration on staging: npx prisma migrate deploy
4. Verify staging: run smoke tests

### Migration Window
5. Scale down API to 0 (if breaking change) or 1 instance
6. Run: npx prisma migrate deploy
7. Verify: check logs for errors, run SELECT 1
8. Scale up API to normal count

### Rollback (if needed)
9. If migration fails: npx prisma migrate resolve --rolled-back
10. OR: restore from manual snapshot
11. Deploy previous API version
```

### 5.2 Backup Runbook

```markdown
## Database Backup & Restore

### Automated Backups (RDS)
- Frequency: every 6 hours
- Retention: 14 days
- Restoration: AWS Console → Snapshots → Restore

### Manual Backup (pg_dump)
```bash
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --format=custom \
  --file=eduomr_$(date +%Y%m%d_%H%M%S).dump
```

### Restoration
```bash
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --clean --if-exists \
  eduomr_20260715_060000.dump
```
```

### 5.3 Query Performance Monitoring

```sql
-- Find slow queries (PostgreSQL)
SELECT query, calls, total_exec_time / calls AS avg_time_ms,
       rows, mean_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

---

## 6. On-Call Schedule

### 6.1 Rotation

| Week | Primary | Secondary |
|---|---|---|
| Week 1 | Engineer A | Engineer B |
| Week 2 | Engineer B | Engineer C |
| Week 3 | Engineer C | Engineer A |
| Week 4 | Engineer A | Engineer D |

### 6.2 Handoff Procedure

```
1. Review open incidents from past week
2. Review recent deployments and changes
3. Verify monitor/alert status
4. Update runbook if new procedures were discovered
5. Slack #eduomr-team: "On-call handoff complete"
```

---

## 7. Environment Management

### 7.1 Environment URLs

| Environment | URL | Infrastructure |
|---|---|---|
| Local | http://localhost:3000 | Docker Compose |
| Dev | https://dev-api.eduomr.com | DO App Platform (1 node) |
| Staging | https://staging-api.eduomr.com | DO App Platform (2 nodes) |
| Production | https://api.eduomr.com | DO App Platform (2+ nodes) |

### 7.2 Environment Promotion

```
Dev (auto-deploy develop)
  → Staging (auto-deploy main)
    → Production (manual approval, tag release)

Data:
  Dev: fresh seed data
  Staging: weekly anonymized prod snapshot
  Production: real data
```

---

## 8. Security Operations

### 8.1 Secret Rotation Schedule

| Secret | Rotation | Method |
|---|---|---|
| JWT_SECRET | Every 90 days | Secrets Manager rotation |
| META_APP_SECRET | Every 90 days | Manual → Secrets Manager |
| SENDGRID_API_KEY | Every 180 days | Manual update |
| Database passwords | Every 180 days | RDS rotation |
| SSL certificates | Every 13 months (90 day auto) | Cloudflare automatic |

### 8.2 Security Scanning Schedule

```
Dependabot:     Daily (automated PR for vuln fixes)
Snyk:           Every PR (block on high+)
SonarQube:      Every PR (quality gate)
OWASP ZAP:      Weekly (full scan)
Pen test:       Quarterly (external vendor)
```

---

## 9. Cost Monitoring

| Resource | Monthly Budget | Alert Threshold |
|---|---|---|
| Compute (App Platform) | $50 | > $75 |
| Database (PostgreSQL) | $20 | > $30 |
| Redis | $15 | > $20 |
| Object Storage | $5 | > $10 |
| CDN + DNS | $5 | > $10 |
| Monitoring + Logging | $10 | > $15 |
| **Total** | **$105** | **> $150** |

---

## 10. Maintenance Windows

| Operation | Frequency | Preferred Window | Expected Downtime |
|---|---|---|---|
| DB migration | Biweekly | Sat 0500-0600 IST | 0 (rolling) |
| Secret rotation | Quarterly | Sat 0500-0600 IST | 0 |
| OS security patch | Monthly | Sat 0300-0500 IST | < 5 min |
| Performance audit | Quarterly | Sat 0200-0600 IST | 0 |
| DR drill | Quarterly | Sat 0600-0800 IST | Variable |

---

## 11. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-15 | Approved | Approved by Founder |

---

## 12. Approval Sign-Off

**Document:** DOC 2.8 — DevOps Plan
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-15 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-15 | ✅ Approved |
