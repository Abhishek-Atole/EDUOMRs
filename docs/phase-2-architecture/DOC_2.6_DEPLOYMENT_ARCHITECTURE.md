# DOC 2.6 — Deployment Architecture

**Document ID:** 2.6
**Title:** Deployment Architecture — Infrastructure, DevOps, CI/CD, Hosting Strategy
**Version:** 1.0.0
**Status:** Draft — Awaiting Approval
**Owner:** Engineering
**Date:** 2026-07-15
**Purpose:** Define the complete deployment architecture — infrastructure topology, CI/CD pipeline, hosting strategy, scaling, and operational monitoring.

---

## 1. Deployment Principles

| Principle | Guideline |
|---|---|
| Infrastructure as Code | All infrastructure defined in Terraform |
| Immutable Deployments | Every deploy creates fresh instances |
| Zero-Downtime Deploy | Rolling updates with health checks |
| 12-Factor App | All config via environment variables |
| Stateless API | All state in DB/Redis — API is stateless |
| Observability | Logs, metrics, traces on every service |
| Backup Critical | Automated DB backups every 6 hours |
| Disaster Recovery | RTO: 1 hour, RPO: 15 minutes |

---

## 2. Infrastructure Topology

```
                          ┌─────────────────────┐
                          │   Cloudflare CDN     │
                          │   (DDoS, SSL, Cache) │
                          └────────┬────────────┘
                                   │
                          ┌────────▼────────────┐
                          │   AWS Application    │
                          │   Load Balancer      │
                          └────────┬────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────▼────────┐ ┌────────▼────────┐ ┌────────▼────────┐
     │   API Server 1  │ │   API Server 2  │ │   API Server N  │
     │   (ECS Fargate) │ │   (ECS Fargate) │ │   (ECS Fargate) │
     └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────▼────────┐ ┌────────▼────────┐ ┌────────▼────────┐
     │  PostgreSQL RDS  │ │  ElastiCache    │ │    S3 Bucket    │
     │  Multi-AZ        │ │  Redis Cluster  │ │  (PDFs, Uploads)│
     │  Read Replica    │ │  (Queue + Cache)│ │   Encrypted     │
     └─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 3. Cloud Provider: AWS

### 3.1 Service Selection

| Service | AWS Product | Justification |
|---|---|---|
| Compute | ECS Fargate (serverless containers) | No EC2 management, auto-scaling |
| Database | RDS PostgreSQL (Multi-AZ) | Managed, automated backups, failover |
| Cache / Queue | ElastiCache Redis | Managed, cluster mode, persistence off |
| Storage | S3 Standard | Durable, encrypted, lifecycle policies |
| CDN | CloudFront | Global edge caching, SSL termination |
| DNS | Route 53 | Managed DNS, health checks |
| Secrets | Secrets Manager | Automatic rotation, audit |
| Monitoring | CloudWatch + Grafana | Metrics, logs, dashboards |
| CI/CD | GitHub Actions | Already on GitHub, zero additional cost |
| Container Registry | ECR | Integrated with ECS |

### 3.2 Alternative: DigitalOcean (Cost-Optimized)

| Service | DigitalOcean | Cost/Month (est.) |
|---|---|---|
| App Platform | Managed containers | $12-36/node × 2 = $24-72 |
| Managed DB | PostgreSQL | $15-60/month |
| Managed Redis | Redis | $12-15/month |
| Spaces (S3) | Object Storage | $5/month |
| Load Balancer | Managed LB | $10/month |
| **Total** | | **$66-162/month** |

**Recommendation:** Start with DigitalOcean for MVP. Migrate to AWS when scale demands it.

---

## 4. Environment Strategy

### 4.1 Environment Matrix

| Environment | Purpose | Deploy Trigger | DB | Data |
|---|---|---|---|---|
| Local | Developer machine | Manual | Local PostgreSQL | Seed data |
| Dev | Integration testing | Push to develop | Dev RDS (shared) | Anonymized |
| Staging | Pre-production validation | PR to main | Staging RDS | Anonymized snapshot |
| Production | Live | Tagged release | Production RDS (Multi-AZ) | Real data |

### 4.2 Branch Strategy

```
develop  ─── feature/xxx ─── develop (PR merge) ─── main (release PR) ─── tag/v1.x.x
              ↑                      ↑                        ↑
         Feature branch          Dev deploy              Staging deploy
                                                            │
                                                     Production deploy
```

---

## 5. CI/CD Pipeline

### 5.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node: 20
      - npm ci
      - npm run lint
      - npm run test:ci

  build-and-push:
    needs: [test]
    if: github.ref == 'refs/heads/main'
    steps:
      - Build Docker image
      - Push to ECR / DO Container Registry
      - Tag with git commit SHA

  deploy-staging:
    needs: [build-and-push]
    environment: staging
    steps:
      - Update ECS service / DO App Platform
      - Health check (3 consecutive successful pings)

  deploy-production:
    needs: [deploy-staging]
    environment: production
    steps:
      - Manual approval gate
      - Rolling update (1 node at a time)
      - Health check after each node
      - Smoke tests (3 min, 10 req/s)
      - Rollback if failures > 5%
```

### 5.2 Pipeline Stages

```
┌──────┐  ┌──────┐  ┌──────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ Lint │→ │ Test │→ │Build │→ │ Staging│→ │ Manual │→ │Production│
│      │  │Jest  │  │Docker│  │ Deploy │  │Approval│  │  Deploy  │
└──────┘  └──────┘  └──────┘  └────────┘  └────────┘  └────────┘
  2 min     5 min     3 min      5 min      variable    10 min
```

---

## 6. Container Configuration

### 6.1 Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["node", "src/app.js"]
```

### 6.2 Resource Limits

| Service | CPU | Memory | Instances (min/max) |
|---|---|---|---|
| API | 1 vCPU | 2 GB | 2 / 10 |
| Bull Worker | 0.5 vCPU | 1 GB | 1 / 3 |
| Frontend (static) | — | — | CDN (serverless) |

### 6.3 Auto-Scaling Rules

| Metric | Scale Out | Scale In |
|---|---|---|
| CPU > 70% for 3 min | +1 instance | — |
| Memory > 80% for 3 min | +1 instance | — |
| Requests/second > 100 | +1 instance | — |
| CPU < 30% for 10 min | — | -1 instance |
| No scaling in if only 2 instances (minimum floor) | — | — |

---

## 7. Database Deployment

### 7.1 PostgreSQL Configuration

```sql
-- Production RDS settings
max_connections = 200
shared_buffers = 2GB
work_mem = 128MB
maintenance_work_mem = 512MB
effective_cache_size = 6GB
wal_level = replica
max_wal_senders = 5
```

### 7.2 Migration Strategy

- Migrations run as a CI step before new API version deploys
- Run: `npx prisma migrate deploy`
- Migrations are backward-compatible (no breaking column changes)
- Rollback: revert code + run down-migration or `prisma migrate resolve`

### 7.3 Backup & Recovery

| Backup Type | Frequency | Retention | Method |
|---|---|---|---|
| Full DB | Every 6 hours | 14 days | RDS automated snapshots |
| Transaction logs | Continuous | 15 min RPO | RDS automated |
| Manual snapshot | Before migrations | 7 days | Manual trigger |
| Export dump | Daily | 30 days | pg_dump → S3 |

---

## 8. Monitoring & Observability

### 8.1 Metrics

| Category | Metrics | Tool |
|---|---|---|
| API | Request rate, latency (p50/p95/p99), error rate | CloudWatch / Grafana |
| Database | Connections, query latency, IOPS, replication lag | RDS Monitoring |
| Redis | Hit rate, memory usage, evictions | ElastiCache metrics |
| Queue | Queue depth, processing time, failure rate | Bull Board (UI) |
| Business | Exams created, sessions started, results released | Custom Grafana |

### 8.2 Logging

- All logs sent to stdout (12-factor)
- ECS/App Platform collects stdout → CloudWatch Logs
- Log retention: 30 days (hot), 1 year (cold S3)
- Winston structured JSON logs

### 8.3 Alerting

```
PagerDuty / Email / Slack alerts for:
  ❌ API error rate > 5%
  ❌ p95 latency > 2000ms
  ❌ DB connections > 150
  ❌ Queue dead-letter > 10
  ❌ Certificate expiry < 30 days
  ⚠️ Disk usage > 80%
  ⚠️ Memory usage > 80%
```

---

## 9. SSL/TLS

| Domain | Certificate | Renewal |
|---|---|---|
| api.eduomr.com | Cloudflare Edge | Automatic |
| app.eduomr.com | Cloudflare Edge | Automatic |
| Internal RDS | RDS-managed | Automatic |

---

## 10. Disaster Recovery

### 10.1 RTO / RPO

| Scenario | RTO | RPO |
|---|---|---|
| Single instance failure | 30 seconds (auto-heal) | 0 |
| AZ failure (RDS Multi-AZ) | 2-5 minutes | 0 |
| Full region failure | 1 hour | 15 minutes |
| Accidental data loss | 4 hours | 6 hours |

### 10.2 Recovery Plan

```
1. DNS failover to secondary region (Route 53 health check)
2. Promote read replica to primary
3. Deploy API containers in secondary region
4. Validate data integrity
5. Update DNS TTL to 60s for faster failback
6. Fail back to primary region within 24 hours
```

---

## 11. Cost Estimate (DigitalOcean, MVP Scale)

| Service | Config | Monthly |
|---|---|---|
| App Platform (2 nodes) | Basic CPU × 2 | $24-36 |
| Managed PostgreSQL | 2GB RAM, 20GB disk | $15 |
| Managed Redis | 256MB | $12 |
| Spaces | 250GB storage | $5 |
| Load Balancer | 1 LB | $10 |
| **Total** | | **$66-78** |

---

## 12. Revision History

| Version | Date | Status | Notes |
|---|---|---|---|
| 1.0.0 | 2026-07-15 | Approved | Approved by Founder |

---

## 13. Approval Sign-Off

**Document:** DOC 2.6 — Deployment Architecture
**Status:** ✅ Approved

| Role | Name | Date | Status |
|---|---|---|---|
| Founder | Abhishek Atole | 2026-07-15 | ✅ Approved |
| Engineering Lead | opencode | 2026-07-15 | ✅ Approved |
