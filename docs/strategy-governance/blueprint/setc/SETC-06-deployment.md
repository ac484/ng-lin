# SETC-06: Deployment and Operations Guide

## Document Information
- **Version**: 1.0
- **Status**: Complete
- **Last Updated**: 2025-12-27

---

## Table of Contents
1. [Deployment Architecture](#deployment-architecture)
2. [CI/CD Pipeline](#cicd-pipeline)
3. [Environment Configuration](#environment-configuration)
4. [Monitoring & Observability](#monitoring--observability)
5. [Backup & Disaster Recovery](#backup--disaster-recovery)
6. [Production Deployment](#production-deployment)

---

## 1. Deployment Architecture

### Environment Strategy

```
┌────────────────────────────────────────────────────────┐
│                     Environments                        │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Development (dev)                                      │
│  - Local dev machines                                   │
│  - Firebase Emulator Suite                              │
│  - Hot reload, debug mode                               │
│                                                         │
│  Staging (staging)                                      │
│  - Firebase Project: gighub-staging                     │
│  - Production-like config                               │
│  - Integration testing                                  │
│                                                         │
│  Production (prod)                                      │
│  - Firebase Project: gighub-prod                        │
│  - Full monitoring & alerts                             │
│  - Blue-green deployment                                │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Infrastructure Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend Hosting** | Firebase Hosting | Static site delivery with CDN |
| **Backend Functions** | Cloud Functions | Server-side logic |
| **Database** | Firestore | NoSQL document store |
| **File Storage** | Cloud Storage | Evidence files (photos, videos, docs) |
| **Authentication** | Firebase Auth | User authentication |
| **Analytics** | Firebase Analytics | Usage tracking |
| **Monitoring** | Cloud Logging | Logs and metrics |

---

## 2. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Job 1: Build and Test Frontend
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint
        run: npm run lint
        
      - name: Build
        run: npm run build --prod
        
      - name: Unit Tests
        run: npm run test:ci
        
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-dist
          path: dist/

  # Job 2: Build and Test Functions
  functions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        
      - name: Install dependencies
        run: cd functions && npm ci
        
      - name: Build
        run: cd functions && npm run build
        
      - name: Test
        run: cd functions && npm test
        
  # Job 3: Security Scan
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        with:
          args: --severity-threshold=high

  # Job 4: Deploy to Staging
  deploy-staging:
    needs: [frontend, functions, security]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v3
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
        
      - name: Deploy to Firebase Staging
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting,functions --project gighub-staging
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN_STAGING }}
          
      - name: Run E2E Tests
        run: npm run e2e:staging

  # Job 5: Deploy to Production
  deploy-production:
    needs: [frontend, functions, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
        
      - name: Deploy to Firebase Production
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting,functions --project gighub-prod
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN_PROD }}
          
      - name: Smoke Tests
        run: npm run test:smoke
        
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          message: 'Deployment to production successful!'
```

### Deployment Scripts

```json
// package.json
{
  "scripts": {
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "deploy:dev": "firebase use dev && firebase deploy",
    "deploy:staging": "firebase use staging && firebase deploy",
    "deploy:prod": "firebase use prod && firebase deploy",
    "functions:deploy": "firebase deploy --only functions",
    "hosting:deploy": "firebase deploy --only hosting"
  }
}
```

---

## 3. Environment Configuration

### Firebase Projects

```bash
# Initialize Firebase projects
firebase projects:create gighub-dev
firebase projects:create gighub-staging
firebase projects:create gighub-prod

# Configure project aliases
firebase use --add gighub-dev --alias dev
firebase use --add gighub-staging --alias staging
firebase use --add gighub-prod --alias prod
```

### Environment Variables

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  firebase: {
    apiKey: process.env['FIREBASE_API_KEY'],
    authDomain: 'gighub-prod.firebaseapp.com',
    projectId: 'gighub-prod',
    storageBucket: 'gighub-prod.appspot.com',
    messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'],
    appId: process.env['FIREBASE_APP_ID']
  },
  apiUrl: 'https://us-central1-gighub-prod.cloudfunctions.net',
  logLevel: 'error'
};
```

### Secrets Management

```bash
# Store secrets in GitHub Secrets
FIREBASE_TOKEN_DEV
FIREBASE_TOKEN_STAGING
FIREBASE_TOKEN_PROD
FIREBASE_API_KEY
SLACK_WEBHOOK
SENTRY_DSN
```

---

## 4. Monitoring & Observability

### Logging Setup

```typescript
// Cloud Functions logging
import { logger } from 'firebase-functions';

export const createContract = onCall(async (request) => {
  logger.info('Creating contract', {
    userId: request.auth?.uid,
    contractData: request.data
  });
  
  try {
    // ... logic
    logger.info('Contract created successfully', { contractId });
  } catch (error) {
    logger.error('Failed to create contract', { error });
    throw error;
  }
});
```

### Performance Monitoring

```typescript
// Frontend performance monitoring
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);

// Automatic tracing
// Firebase Performance automatically tracks:
// - Page load time
// - Network requests
// - Custom traces
```

### Error Tracking (Sentry)

```typescript
import * as Sentry from '@sentry/angular';

Sentry.init({
  dsn: environment.sentryDsn,
  environment: environment.production ? 'production' : 'development',
  tracesSampleRate: 1.0,
});
```

### Metrics Dashboard

```
Grafana Dashboard Components:
- Request rate (req/sec)
- Error rate (errors/sec)
- Response time (p50, p95, p99)
- Active users
- Database reads/writes
- Cloud Function executions
- Storage usage
```

---

## 5. Backup & Disaster Recovery

### Firestore Backup

```bash
# Automated daily backup
gcloud firestore export gs://gighub-backups/$(date +%Y%m%d) \
  --project=gighub-prod

# Restore from backup
gcloud firestore import gs://gighub-backups/20250127 \
  --project=gighub-prod
```

### Cloud Storage Backup

```bash
# Enable versioning on storage buckets
gsutil versioning set on gs://gighub-prod.appspot.com

# Lifecycle policy for old versions
gsutil lifecycle set lifecycle.json gs://gighub-prod.appspot.com
```

**lifecycle.json**:
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "numNewerVersions": 3,
          "isLive": false
        }
      }
    ]
  }
}
```

### Disaster Recovery Plan

**RPO (Recovery Point Objective)**: 24 hours  
**RTO (Recovery Time Objective)**: 4 hours

**Recovery Steps**:
1. Assess incident severity
2. Activate incident response team
3. Restore from latest backup
4. Verify data integrity
5. Resume operations
6. Post-incident review

---

## 6. Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] Security scan passed
- [ ] Code review approved
- [ ] Database migrations tested
- [ ] Firestore security rules validated
- [ ] Performance benchmarks met
- [ ] Monitoring alerts configured
- [ ] Backup verified
- [ ] Rollback plan ready
- [ ] Stakeholders notified

### Deployment Process

```bash
# 1. Switch to production
firebase use prod

# 2. Build production artifacts
npm run build:prod

# 3. Deploy Cloud Functions first
firebase deploy --only functions

# 4. Wait for health check
./scripts/health-check.sh

# 5. Deploy hosting
firebase deploy --only hosting

# 6. Smoke tests
npm run test:smoke

# 7. Monitor for errors
./scripts/monitor.sh
```

### Blue-Green Deployment

```bash
# Deploy to "green" environment
firebase hosting:channel:deploy green --only hosting

# Test green environment
curl https://green---gighub-prod.web.app/health

# Switch traffic to green
firebase hosting:clone gighub-prod:live green

# Monitor for 1 hour
# If issues, rollback:
firebase hosting:clone gighub-prod:live blue
```

### Rollback Procedure

```bash
# 1. Identify last good deployment
firebase hosting:releases:list

# 2. Rollback hosting
firebase hosting:rollback

# 3. Rollback functions (redeploy previous version)
firebase deploy --only functions --version=previous

# 4. Verify
./scripts/health-check.sh

# 5. Notify team
./scripts/notify-rollback.sh
```

### Post-Deployment Validation

```bash
# Health check script
#!/bin/bash
echo "Running health checks..."

# Check frontend
curl -f https://gighub-prod.web.app/health || exit 1

# Check API
curl -f https://us-central1-gighub-prod.cloudfunctions.net/health || exit 1

# Check Firestore
firebase firestore:get contracts/test-contract || exit 1

echo "All health checks passed ✅"
```

### Monitoring Dashboard

**Key Metrics to Monitor**:
- Error rate < 0.1%
- Response time p99 < 1000ms
- Uptime > 99.9%
- Active users
- Database operations/sec
- Function execution time

**Alert Thresholds**:
- Critical: Error rate > 1%
- Warning: Response time p99 > 500ms
- Info: Unusual traffic patterns

---

## Summary

This document provides:
- ✅ Complete deployment architecture (dev/staging/prod)
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Environment configuration management
- ✅ Monitoring & observability setup
- ✅ Backup & disaster recovery procedures
- ✅ Production deployment checklist & process
- ✅ Rollback procedures

**Next Steps**:
1. Set up Firebase projects
2. Configure GitHub Actions
3. Implement monitoring
4. Test backup/restore procedures
5. Conduct disaster recovery drill

**Related**: [SETC-04-implementation-plan.md](./SETC-04-implementation-plan.md), [SETC-05-testing-strategy.md](./SETC-05-testing-strategy.md)
