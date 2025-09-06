# Deployment Checklist and Rollback Procedures

## Pre-Deployment Checklist

### Code Quality and Testing

- [ ] **All tests pass**
  ```bash
  npm run test:all
  npm run test:e2e
  npm run test:a11y
  ```

- [ ] **Code review completed**
  - [ ] Security review for sensitive changes
  - [ ] Performance impact assessment
  - [ ] Breaking changes documented

- [ ] **Linting and formatting**
  ```bash
  npm run lint
  npm run build
  ```

- [ ] **Bundle analysis (if significant changes)**
  ```bash
  npm run build:analyze
  ```

### Database and Schema

- [ ] **Database migrations tested**
  - [ ] Test migration on staging database
  - [ ] Verify rollback migration works
  - [ ] Check for data loss scenarios

- [ ] **Schema changes documented**
  - [ ] Breaking changes identified
  - [ ] Migration strategy documented
  - [ ] Rollback plan prepared

- [ ] **Backup verification**
  - [ ] Recent backup exists
  - [ ] Backup restoration tested
  - [ ] Recovery time documented

### Environment Configuration

- [ ] **Environment variables updated**
  - [ ] Production environment variables set
  - [ ] Secrets properly configured
  - [ ] Database connection string updated

- [ ] **Configuration files reviewed**
  - [ ] `vercel.json` configuration correct
  - [ ] `next.config.js` production-ready
  - [ ] Environment-specific settings verified

### Security and Performance

- [ ] **Security scan completed**
  - [ ] Dependency vulnerabilities checked
  - [ ] Security headers configured
  - [ ] API endpoints secured

- [ ] **Performance benchmarks**
  - [ ] Core Web Vitals measured
  - [ ] API response times tested
  - [ ] Database query performance verified

### Monitoring and Observability

- [ ] **Monitoring setup verified**
  - [ ] Error tracking configured (Sentry)
  - [ ] Performance monitoring active
  - [ ] Health checks working

- [ ] **Alerting configured**
  - [ ] Critical alerts set up
  - [ ] Notification channels tested
  - [ ] Escalation procedures documented

## Deployment Process

### 1. Pre-Deployment Steps

```bash
# 1. Ensure you're on the correct branch
git checkout main
git pull origin main

# 2. Run final tests
npm run test:all

# 3. Build and verify
npm run build

# 4. Check for any last-minute issues
npm run lint
```

### 2. Staging Deployment

- [ ] **Deploy to staging environment**
  ```bash
  # If using separate staging branch
  git checkout staging
  git merge main
  git push origin staging
  ```

- [ ] **Staging verification**
  - [ ] Application loads correctly
  - [ ] Critical user flows work
  - [ ] Database connections successful
  - [ ] API endpoints responding
  - [ ] Authentication working (if applicable)

- [ ] **Performance testing on staging**
  - [ ] Load testing completed
  - [ ] Memory usage acceptable
  - [ ] Response times within limits

### 3. Production Deployment

- [ ] **Announce maintenance window** (if needed)
  - [ ] Notify users of potential downtime
  - [ ] Update status page
  - [ ] Coordinate with team

- [ ] **Database backup**
  ```bash
  # Create pre-deployment backup
  # This depends on your database provider
  # For Neon: Use their backup feature
  # For Supabase: Use pg_dump or their backup tools
  ```

- [ ] **Deploy to production**
  ```bash
  # Using Vercel CLI
  vercel --prod

  # Or push to main branch (if auto-deploy configured)
  git push origin main
  ```

- [ ] **Monitor deployment**
  - [ ] Watch Vercel deployment logs
  - [ ] Monitor error rates
  - [ ] Check application health

### 4. Post-Deployment Verification

- [ ] **Smoke tests**
  - [ ] Application loads at production URL
  - [ ] Health check endpoint responds
  - [ ] Database connectivity verified
  - [ ] Critical API endpoints working

- [ ] **Functional verification**
  - [ ] User can create entries
  - [ ] Dashboard displays correctly
  - [ ] Reports generate properly
  - [ ] CSV import works
  - [ ] Search and filtering functional

- [ ] **Performance verification**
  - [ ] Page load times acceptable (<2s)
  - [ ] API response times normal (<500ms)
  - [ ] No memory leaks detected
  - [ ] Error rates within normal range (<1%)

- [ ] **Monitoring verification**
  - [ ] Error tracking receiving data
  - [ ] Performance metrics updating
  - [ ] Alerts functioning correctly

## Rollback Procedures

### When to Rollback

**Immediate rollback required:**
- Application completely down
- Critical security vulnerability exposed
- Data corruption detected
- >50% error rate for >5 minutes

**Consider rollback:**
- Performance degradation >50%
- Critical features not working
- Database connection issues
- User-reported critical bugs

### Rollback Process

#### 1. Quick Rollback (Vercel)

```bash
# Option 1: Rollback via Vercel CLI
vercel rollback [deployment-url]

# Option 2: Rollback via Vercel Dashboard
# 1. Go to Vercel dashboard
# 2. Select your project
# 3. Go to Deployments tab
# 4. Find previous stable deployment
# 5. Click "Promote to Production"
```

#### 2. Database Rollback (if needed)

```bash
# If database changes were made, you may need to:
# 1. Restore from backup
# 2. Run rollback migrations
# 3. Verify data integrity

# Example for Prisma migrations
npx prisma migrate resolve --rolled-back [migration-name]
```

#### 3. Verification After Rollback

- [ ] **Application functionality**
  - [ ] Core features working
  - [ ] No data loss
  - [ ] Performance restored

- [ ] **Monitoring checks**
  - [ ] Error rates normalized
  - [ ] Performance metrics improved
  - [ ] User reports decreased

#### 4. Communication

- [ ] **Internal communication**
  - [ ] Notify team of rollback
  - [ ] Document rollback reason
  - [ ] Plan fix strategy

- [ ] **External communication**
  - [ ] Update status page
  - [ ] Notify affected users (if needed)
  - [ ] Provide ETA for fix

## Emergency Procedures

### Critical System Down

1. **Immediate Response (0-5 minutes)**
   ```bash
   # Check system status
   curl https://your-app.vercel.app/api/health
   
   # Check Vercel status
   # Visit Vercel dashboard for deployment status
   
   # Quick rollback if recent deployment
   vercel rollback
   ```

2. **Assessment (5-15 minutes)**
   - Check error logs in Vercel dashboard
   - Review Sentry error reports
   - Identify scope of impact
   - Determine if rollback is sufficient

3. **Communication (15-30 minutes)**
   - Update status page
   - Notify stakeholders
   - Provide initial ETA

### Database Issues

1. **Immediate Actions**
   ```bash
   # Check database status
   # This depends on your provider (Neon, Supabase, etc.)
   
   # Verify connection
   npx prisma db pull
   
   # Check for corruption
   # Run basic queries to verify data integrity
   ```

2. **Recovery Options**
   - Switch to read-only mode if possible
   - Restore from recent backup
   - Contact database provider support

### Performance Degradation

1. **Quick Diagnostics**
   - Check Vercel function logs
   - Review database query performance
   - Monitor memory usage
   - Check for infinite loops or memory leaks

2. **Immediate Fixes**
   - Restart functions (redeploy)
   - Clear caches if applicable
   - Scale resources if possible

## Post-Incident Procedures

### Incident Documentation

Create incident report with:
- [ ] **Timeline of events**
- [ ] **Root cause analysis**
- [ ] **Impact assessment**
- [ ] **Resolution steps taken**
- [ ] **Lessons learned**
- [ ] **Prevention measures**

### Follow-up Actions

- [ ] **Fix underlying issues**
- [ ] **Update monitoring/alerting**
- [ ] **Improve deployment process**
- [ ] **Update documentation**
- [ ] **Team retrospective**

## Deployment Automation

### GitHub Actions Workflow (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Deployment Scripts

Update `package.json` scripts:

```json
{
  "scripts": {
    "deploy:staging": "vercel",
    "deploy:prod": "vercel --prod",
    "deploy:check": "vercel inspect",
    "rollback": "vercel rollback"
  }
}
```

## Environment-Specific Configurations

### Development
- SQLite database
- Detailed logging
- Hot reloading
- Debug mode enabled

### Staging
- PostgreSQL database (separate from prod)
- Production-like configuration
- Monitoring enabled
- Test data

### Production
- PostgreSQL database
- Optimized builds
- Error tracking
- Performance monitoring
- Security headers

## Maintenance Windows

### Planned Maintenance

1. **Schedule during low-usage hours**
2. **Notify users 24-48 hours in advance**
3. **Prepare rollback plan**
4. **Test in staging first**
5. **Monitor closely during and after**

### Emergency Maintenance

1. **Assess urgency and impact**
2. **Notify immediately if user-facing**
3. **Document all actions taken**
4. **Communicate resolution timeline**

## Contact Information

### Emergency Contacts
- **Primary Developer**: [Your contact info]
- **Database Provider Support**: [Provider support contact]
- **Vercel Support**: [Vercel support if on paid plan]

### Escalation Path
1. Primary developer
2. Technical lead
3. Project manager
4. External support (if needed)

This checklist ensures systematic, safe deployments with clear rollback procedures for when things go wrong.