# Deployment Guide

## Prerequisites

- Node.js 20.x
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Supabase CLI (optional, for database management)

## Environment Setup

### 1. Development Environment

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:4200
```

### 2. Staging Environment

```bash
# Build for staging
npm run build

# Deploy to Firebase Hosting (Staging)
firebase use staging
firebase deploy --only hosting

# Verify deployment
curl https://ng-lin-staging.web.app/health
```

### 3. Production Environment

```bash
# Build for production
npm run build --configuration=production

# Deploy to Firebase Hosting (Production)
firebase use production
firebase deploy --only hosting

# Verify deployment
curl https://ng-lin.web.app/health
```

## Environment Variables

Create `.env.development`, `.env.staging`, `.env.production` files:

```env
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Application Configuration
APP_ENV=production
APP_VERSION=1.0.0
API_TIMEOUT=30000
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (`npm run test`)
- [ ] Build successful (`npm run build`)
- [ ] Linting passing (`npm run lint`)
- [ ] Dependencies updated (`npm audit`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security rules deployed

### Deployment
- [ ] Tag release in Git
- [ ] Build production bundle
- [ ] Deploy to Firebase Hosting
- [ ] Deploy security rules
- [ ] Verify health endpoints
- [ ] Run smoke tests

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Check database connections
- [ ] Monitor user feedback

## Rollback Procedure

If issues are detected post-deployment:

```bash
# Option 1: Firebase Hosting Rollback
firebase hosting:rollback

# Option 2: Deploy previous version
git checkout v1.0.0
npm run build
firebase deploy --only hosting

# Option 3: Use Firebase Console
# Navigate to Hosting > Release History > Rollback
```

## Health Checks

### Application Health
```bash
GET /health
Response: { "status": "healthy", "version": "1.0.0" }
```

### Database Health
```bash
GET /health/database
Response: { "firebase": "connected", "supabase": "connected" }
```

## Monitoring

### Firebase Console
- https://console.firebase.google.com
- Monitor authentication, hosting, database

### Supabase Dashboard
- https://app.supabase.com
- Monitor database, API, storage

### Application Logs
- Firebase Functions logs
- Browser console errors
- Performance metrics

## Security

### Firebase Security Rules
```bash
# Deploy security rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Environment Security
- Never commit `.env` files
- Use Firebase Environment Config for secrets
- Rotate API keys regularly
- Use least-privilege IAM roles

## Performance

### Build Optimization
```bash
# Analyze bundle size
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

### Caching Strategy
- Static assets: 1 year cache
- API responses: 5 minutes cache
- User data: No cache

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules dist .angular
npm install
npm run build
```

### Deployment Fails
```bash
# Check Firebase CLI version
firebase --version

# Login again
firebase logout
firebase login

# Try again
firebase deploy
```

### Runtime Errors
- Check browser console
- Check Firebase logs
- Verify environment variables
- Check database connections
