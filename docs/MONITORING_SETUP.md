# Production Monitoring and Error Tracking Setup

## Overview

This document outlines the monitoring and error tracking setup for Freelancian MVP in production. The setup includes error tracking, performance monitoring, and basic analytics.

## Error Tracking with Sentry (Recommended)

### Setup Instructions

1. **Create Sentry Account**:
   - Go to [sentry.io](https://sentry.io)
   - Create a new project for Next.js
   - Copy your DSN (Data Source Name)

2. **Install Sentry SDK**:
   ```bash
   npm install @sentry/nextjs
   ```

3. **Configure Sentry**:
   Create `sentry.client.config.ts`:
   ```typescript
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
     debug: false,
     replaysOnErrorSampleRate: 1.0,
     replaysSessionSampleRate: 0.1,
     integrations: [
       new Sentry.Replay({
         maskAllText: true,
         blockAllMedia: true,
       }),
     ],
   });
   ```

   Create `sentry.server.config.ts`:
   ```typescript
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
     debug: false,
   });
   ```

4. **Add Environment Variables**:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
   SENTRY_ORG=your_org
   SENTRY_PROJECT=your_project
   SENTRY_AUTH_TOKEN=your_auth_token
   ```

5. **Configure Next.js**:
   Update `next.config.js`:
   ```javascript
   const { withSentryConfig } = require('@sentry/nextjs');

   const nextConfig = {
     // ... existing config
   };

   module.exports = withSentryConfig(
     nextConfig,
     {
       silent: true,
       org: process.env.SENTRY_ORG,
       project: process.env.SENTRY_PROJECT,
     },
     {
       widenClientFileUpload: true,
       transpileClientSDK: true,
       tunnelRoute: "/monitoring",
       hideSourceMaps: true,
       disableLogger: true,
     }
   );
   ```

### Custom Error Tracking

Create `src/lib/monitoring.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

export function captureError(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: {
        component: context?.component || 'unknown',
        action: context?.action || 'unknown',
      },
      extra: context,
    });
  } else {
    console.error('Error captured:', error, context);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}

export function setUserContext(user: { id: string; email?: string }) {
  Sentry.setUser(user);
}

export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}
```

## Vercel Analytics

### Setup Instructions

1. **Enable in Vercel Dashboard**:
   - Go to your project in Vercel dashboard
   - Navigate to Analytics tab
   - Enable Web Analytics

2. **Install Vercel Analytics**:
   ```bash
   npm install @vercel/analytics
   ```

3. **Add to App**:
   Update `src/app/layout.tsx`:
   ```typescript
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en">
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

## Performance Monitoring

### Web Vitals Tracking

Create `src/lib/web-vitals.ts`:
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
}

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

### Custom Performance Metrics

Create `src/lib/performance.ts`:
```typescript
export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  startTimer(name: string): void {
    this.metrics.set(name, performance.now());
  }

  endTimer(name: string): number {
    const startTime = this.metrics.get(name);
    if (!startTime) {
      console.warn(`Timer ${name} was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(name);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration}ms`);
    }

    return duration;
  }

  trackApiCall(endpoint: string, method: string, duration: number, status: number): void {
    const metric = {
      endpoint,
      method,
      duration,
      status,
      timestamp: new Date().toISOString(),
    };

    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to your monitoring service
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      }).catch(console.error);
    }
  }
}

export const performanceTracker = PerformanceTracker.getInstance();
```

## Database Monitoring

### Query Performance Tracking

Create `src/lib/db-monitoring.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

export function createMonitoredPrismaClient(): PrismaClient {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  });

  // Add query performance monitoring
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    
    const duration = after - before;
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`);
      
      // Send to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        // captureMessage(`Slow query: ${params.model}.${params.action} (${duration}ms)`, 'warning');
      }
    }

    return result;
  });

  return prisma;
}
```

## Health Checks

### API Health Check Endpoint

Create `src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check other services if needed
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        api: 'healthy',
      },
      version: process.env.npm_package_version || '0.1.0',
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unhealthy',
        api: 'healthy',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(healthStatus, { status: 503 });
  }
}
```

## Uptime Monitoring

### Recommended Services

1. **UptimeRobot** (Free tier available):
   - Monitor your main URL and health check endpoint
   - Set up alerts for downtime
   - Configure: https://uptimerobot.com

2. **Pingdom** (Paid):
   - More detailed monitoring
   - Performance insights
   - Global monitoring locations

3. **Better Uptime** (Free tier):
   - Modern interface
   - Incident management
   - Status page creation

### Setup Instructions

1. Create monitors for:
   - Main application URL: `https://your-app.vercel.app`
   - Health check endpoint: `https://your-app.vercel.app/api/health`
   - Critical API endpoints: `https://your-app.vercel.app/api/entries`

2. Configure alerts:
   - Email notifications for downtime
   - Slack/Discord webhooks if using team chat
   - SMS for critical issues (optional)

## Log Management

### Structured Logging

Create `src/lib/logger.ts`:
```typescript
interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  component?: string;
  [key: string]: any;
}

class Logger {
  private log(level: string, message: string, context?: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    };

    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry));
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, context || '');
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context);
    }
  }
}

export const logger = new Logger();
```

## Monitoring Dashboard

### Key Metrics to Track

1. **Application Metrics**:
   - Response times for API endpoints
   - Error rates by endpoint
   - Database query performance
   - User actions (entry creation, imports, etc.)

2. **Business Metrics**:
   - Daily active users
   - Entry creation rate
   - Import success rate
   - Feature usage statistics

3. **Infrastructure Metrics**:
   - Server response times
   - Database connection pool usage
   - Memory and CPU usage (Vercel provides these)

### Custom Metrics API

Create `src/app/api/metrics/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();
    
    // Log the metric
    logger.info('Custom metric received', {
      component: 'metrics-api',
      metric,
    });

    // In production, you might want to:
    // 1. Store metrics in a time-series database
    // 2. Send to external monitoring service
    // 3. Aggregate and analyze

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to process metric', error as Error, {
      component: 'metrics-api',
    });
    
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    );
  }
}
```

## Alerting Rules

### Critical Alerts (Immediate Response)

1. **Application Down**: Health check fails for 2+ minutes
2. **High Error Rate**: >5% error rate for 5+ minutes
3. **Database Issues**: Connection failures or slow queries
4. **API Failures**: Critical endpoints returning errors

### Warning Alerts (Monitor Closely)

1. **Slow Performance**: Response times >2 seconds
2. **High Memory Usage**: >80% memory utilization
3. **Unusual Traffic**: 10x normal traffic patterns
4. **Import Failures**: CSV import success rate <90%

## Security Monitoring

### Security Headers Check

Create `src/middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Implementation Checklist

- [ ] Set up Sentry for error tracking
- [ ] Enable Vercel Analytics
- [ ] Configure performance monitoring
- [ ] Set up database query monitoring
- [ ] Create health check endpoint
- [ ] Configure uptime monitoring service
- [ ] Implement structured logging
- [ ] Set up alerting rules
- [ ] Add security headers
- [ ] Test monitoring in staging environment
- [ ] Document incident response procedures

## Incident Response

### Response Procedures

1. **Immediate Response** (0-15 minutes):
   - Acknowledge the alert
   - Check application status
   - Identify affected users/features
   - Implement quick fixes if possible

2. **Investigation** (15-60 minutes):
   - Analyze logs and metrics
   - Identify root cause
   - Develop fix plan
   - Communicate status to stakeholders

3. **Resolution** (1+ hours):
   - Implement permanent fix
   - Test thoroughly
   - Deploy fix
   - Monitor for recurrence

4. **Post-Incident** (24-48 hours):
   - Write incident report
   - Identify prevention measures
   - Update monitoring/alerting
   - Share learnings with team

This monitoring setup provides comprehensive visibility into your application's health, performance, and user experience in production.