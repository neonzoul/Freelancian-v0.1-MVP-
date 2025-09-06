# Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying Freelancian MVP to production using Vercel and PostgreSQL database.

## Prerequisites

Before starting the deployment process, ensure you have:

- [x] **Vercel account** - Sign up at [vercel.com](https://vercel.com)
- [x] **GitHub repository** - Code pushed to GitHub
- [x] **PostgreSQL database** - Neon, Supabase, or similar provider
- [x] **Sentry account** (optional) - For error tracking
- [x] **Domain name** (optional) - For custom domain

## Step 1: Database Setup

### Option A: Neon (Recommended)

1. **Create Neon Account**:
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub or email
   - Create a new project

2. **Get Database URL**:
   - Copy the connection string from your Neon dashboard
   - Format: `postgresql://username:password@host:port/database?sslmode=require`

3. **Test Connection**:
   ```bash
   # Test locally first
   DATABASE_URL="your_neon_url" npx prisma db push
   ```

### Option B: Supabase

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for setup to complete

2. **Get Database URL**:
   - Go to Settings > Database
   - Copy the connection string
   - Use the "Connection pooling" URL for better performance

### Option C: Railway

1. **Create Railway Account**:
   - Go to [railway.app](https://railway.app)
   - Connect with GitHub
   - Create new project with PostgreSQL

2. **Get Database URL**:
   - Copy from Railway dashboard
   - Format will be provided automatically

## Step 2: Environment Variables Setup

Create a `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Next.js
NEXTAUTH_SECRET="your-secure-random-string-32-chars-minimum"
NEXTAUTH_URL="https://your-app.vercel.app"
NODE_ENV="production"

# Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN="your_sentry_dsn_here"
SENTRY_ORG="your_sentry_org"
SENTRY_PROJECT="your_sentry_project"
SENTRY_AUTH_TOKEN="your_sentry_auth_token"

# Analytics (Optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your_analytics_id"

# Feature Flags
MONITORING_ENABLED="true"
PERFORMANCE_MONITORING="true"
ERROR_TRACKING="true"
```

## Step 3: Vercel Deployment

### Method A: Vercel Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build:prod`
   - Output Directory: `.next`
   - Install Command: `npm ci`

3. **Add Environment Variables**:
   - Go to Project Settings > Environment Variables
   - Add all variables from your `.env.production` file
   - Make sure to select "Production" environment

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Test the deployment URL

### Method B: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login and Deploy**:
   ```bash
   # Login to Vercel
   vercel login
   
   # Deploy to production
   vercel --prod
   ```

3. **Set Environment Variables**:
   ```bash
   # Add environment variables
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_SECRET production
   # ... add all other variables
   ```

## Step 4: Database Migration

After successful deployment:

1. **Run Database Migration**:
   ```bash
   # Using Vercel CLI
   vercel env pull .env.local
   npx prisma db push
   
   # Or trigger from Vercel dashboard
   # Go to Functions tab and trigger a build
   ```

2. **Seed Database (Optional)**:
   ```bash
   # Seed with demo data
   npx prisma db seed
   ```

3. **Verify Database**:
   - Check your database provider dashboard
   - Verify tables are created
   - Test a few API endpoints

## Step 5: Domain Configuration (Optional)

### Custom Domain Setup

1. **Add Domain in Vercel**:
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**:
   ```bash
   # Update NEXTAUTH_URL to your custom domain
   NEXTAUTH_URL="https://yourdomain.com"
   ```

3. **SSL Certificate**:
   - Vercel automatically provides SSL certificates
   - Verify HTTPS is working

## Step 6: Monitoring Setup

### Sentry Error Tracking

1. **Create Sentry Project**:
   - Go to [sentry.io](https://sentry.io)
   - Create new Next.js project
   - Copy DSN and configuration

2. **Install Sentry SDK**:
   ```bash
   npm install @sentry/nextjs
   ```

3. **Configure Sentry**:
   ```bash
   # Run monitoring setup script
   npm run monitor:setup
   ```

### Vercel Analytics

1. **Enable in Dashboard**:
   - Go to Vercel project dashboard
   - Navigate to Analytics tab
   - Enable Web Analytics

2. **Install Analytics Package**:
   ```bash
   npm install @vercel/analytics
   ```

### Uptime Monitoring

1. **Choose Service**:
   - UptimeRobot (free tier available)
   - Pingdom (paid)
   - Better Uptime (free tier)

2. **Configure Monitors**:
   - Main URL: `https://your-app.vercel.app`
   - Health check: `https://your-app.vercel.app/api/health`
   - API endpoints: `https://your-app.vercel.app/api/entries`

## Step 7: Verification

### Automated Verification

```bash
# Run deployment verification script
npm run deploy:verify:prod

# Or specify custom URL
node scripts/verify-deployment.js --url https://your-app.vercel.app
```

### Manual Verification Checklist

- [ ] **Homepage loads correctly**
- [ ] **Dashboard displays metrics**
- [ ] **Entry creation works**
- [ ] **Entry editing and deletion work**
- [ ] **Reports page shows charts**
- [ ] **CSV import functionality works**
- [ ] **Search and filtering work**
- [ ] **Mobile responsiveness**
- [ ] **Performance is acceptable (<3s load time)**
- [ ] **Error tracking is working**
- [ ] **Health check endpoint responds**

### Performance Testing

```bash
# Test Core Web Vitals
# Use tools like:
# - Google PageSpeed Insights
# - GTmetrix
# - WebPageTest
# - Lighthouse CI
```

## Step 8: Post-Deployment Tasks

### Security Configuration

1. **Review Security Headers**:
   ```bash
   # Check security headers
   curl -I https://your-app.vercel.app
   ```

2. **Enable Security Features**:
   - Content Security Policy (CSP)
   - HTTP Strict Transport Security (HSTS)
   - X-Frame-Options
   - X-Content-Type-Options

### Backup Strategy

1. **Database Backups**:
   - Enable automatic backups in your database provider
   - Test backup restoration process
   - Document recovery procedures

2. **Code Backups**:
   - Ensure GitHub repository is properly backed up
   - Tag production releases
   - Maintain deployment history

### Monitoring Configuration

1. **Set Up Alerts**:
   - Error rate > 5%
   - Response time > 2 seconds
   - Uptime < 99%
   - Database connection failures

2. **Create Dashboards**:
   - Application performance metrics
   - User behavior analytics
   - Error tracking and resolution
   - Business metrics (entries created, etc.)

## Troubleshooting

### Common Issues

#### Build Failures

**Issue**: Build fails during deployment
```bash
# Check build logs in Vercel dashboard
# Common causes:
# - Missing environment variables
# - TypeScript errors
# - Dependency issues
# - Database connection during build
```

**Solution**:
```bash
# Test build locally
npm run build:prod

# Check for TypeScript errors
npm run lint

# Verify environment variables
vercel env ls
```

#### Database Connection Issues

**Issue**: Cannot connect to database
```bash
# Error: "Can't reach database server"
```

**Solution**:
```bash
# Verify DATABASE_URL format
# Check database provider status
# Ensure IP whitelist includes Vercel IPs (if applicable)
# Test connection locally
```

#### Performance Issues

**Issue**: Slow page load times
```bash
# Check bundle size
npm run build:analyze

# Monitor Core Web Vitals
# Use Vercel Analytics
# Check database query performance
```

**Solution**:
```bash
# Optimize images
# Enable caching
# Optimize database queries
# Use CDN for static assets
```

### Rollback Procedures

#### Quick Rollback

```bash
# Using Vercel CLI
vercel rollback [deployment-url]

# Or use Vercel dashboard
# Go to Deployments tab
# Click "Promote to Production" on previous deployment
```

#### Database Rollback

```bash
# If database changes were made
# Restore from backup
# Run rollback migrations if needed
```

## Maintenance

### Regular Tasks

#### Weekly
- [ ] Review error logs in Sentry
- [ ] Check performance metrics
- [ ] Verify backup integrity
- [ ] Update dependencies (if needed)

#### Monthly
- [ ] Review and optimize database performance
- [ ] Analyze user behavior and usage patterns
- [ ] Update documentation
- [ ] Security audit and updates

#### Quarterly
- [ ] Review and update monitoring alerts
- [ ] Performance optimization review
- [ ] Disaster recovery testing
- [ ] Cost optimization review

### Updates and Deployments

#### Development Workflow

```bash
# 1. Develop and test locally
npm run dev
npm run test:all

# 2. Deploy to staging (if available)
vercel --target staging

# 3. Run verification tests
npm run deploy:verify

# 4. Deploy to production
vercel --prod

# 5. Verify production deployment
npm run deploy:verify:prod
```

#### Emergency Procedures

1. **Critical Bug Fix**:
   - Create hotfix branch
   - Fix and test locally
   - Deploy directly to production
   - Monitor closely

2. **Security Issue**:
   - Assess impact immediately
   - Apply fix or rollback
   - Update security measures
   - Document incident

## Support and Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

### Community Support
- [Vercel Discord](https://vercel.com/discord)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Prisma Discord](https://pris.ly/discord)

### Professional Support
- Vercel Pro/Enterprise support
- Database provider support
- Third-party monitoring services

## Conclusion

Following this guide ensures a robust, monitored, and maintainable production deployment of Freelancian MVP. The combination of Vercel's platform, PostgreSQL database, and comprehensive monitoring provides a solid foundation for serving Thai freelancers with reliable financial tracking capabilities.

Remember to:
- Test thoroughly before going live
- Monitor closely after deployment
- Have rollback procedures ready
- Keep documentation updated
- Plan for scaling as usage grows

Your Freelancian MVP is now ready to help Thai freelancers manage their finances effectively! 🎉