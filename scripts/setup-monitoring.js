#!/usr/bin/env node

/**
 * Production Monitoring Setup Script
 * 
 * This script helps set up monitoring and error tracking for Freelancian MVP
 * in production environment.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up production monitoring...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Please run this script from the project root directory');
  process.exit(1);
}

// Read package.json to verify project
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (packageJson.name !== 'freelancian-mvp') {
  console.error('❌ Error: This script is designed for Freelancian MVP project');
  process.exit(1);
}

// Monitoring setup steps
const setupSteps = [
  {
    name: 'Environment Variables Check',
    check: () => {
      const envExample = fs.readFileSync('.env.example', 'utf8');
      return envExample.includes('NEXT_PUBLIC_SENTRY_DSN');
    },
    setup: () => {
      console.log('📝 Adding monitoring environment variables to .env.example...');
      const envContent = `
# Monitoring and Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id

# Monitoring
MONITORING_ENABLED=true
PERFORMANCE_MONITORING=true
ERROR_TRACKING=true
`;
      fs.appendFileSync('.env.example', envContent);
      console.log('✅ Environment variables added to .env.example');
    }
  },
  {
    name: 'Sentry Configuration Files',
    check: () => {
      return fs.existsSync('sentry.client.config.ts') && fs.existsSync('sentry.server.config.ts');
    },
    setup: () => {
      console.log('📝 Creating Sentry configuration files...');
      
      // Client config
      const clientConfig = `import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event) {
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'ChunkLoadError' || error?.type === 'ResizeObserver loop limit exceeded') {
          return null;
        }
      }
    }
    return event;
  },
});
`;

      // Server config
      const serverConfig = `import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  beforeSend(event) {
    // Filter out non-critical server errors
    if (process.env.NODE_ENV === 'production') {
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'ECONNRESET' || error?.type === 'EPIPE') {
          return null;
        }
      }
    }
    return event;
  },
});
`;

      fs.writeFileSync('sentry.client.config.ts', clientConfig);
      fs.writeFileSync('sentry.server.config.ts', serverConfig);
      console.log('✅ Sentry configuration files created');
    }
  },
  {
    name: 'Health Check API Endpoint',
    check: () => {
      return fs.existsSync('src/app/api/health/route.ts');
    },
    setup: () => {
      console.log('📝 Creating health check API endpoint...');
      
      const healthCheckDir = 'src/app/api/health';
      if (!fs.existsSync(healthCheckDir)) {
        fs.mkdirSync(healthCheckDir, { recursive: true });
      }
      
      const healthCheckContent = `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw\`SELECT 1\`;
    
    // Check other services if needed
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        api: 'healthy',
      },
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(healthStatus, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unhealthy',
        api: 'healthy',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(healthStatus, { status: 503 });
  }
}
`;
      
      fs.writeFileSync(path.join(healthCheckDir, 'route.ts'), healthCheckContent);
      console.log('✅ Health check API endpoint created');
    }
  },
  {
    name: 'Monitoring Library',
    check: () => {
      return fs.existsSync('src/lib/monitoring.ts');
    },
    setup: () => {
      console.log('📝 Creating monitoring library...');
      
      const monitoringContent = `import * as Sentry from "@sentry/nextjs";

export function captureError(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production' && process.env.ERROR_TRACKING === 'true') {
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
  if (process.env.NODE_ENV === 'production' && process.env.ERROR_TRACKING === 'true') {
    Sentry.captureMessage(message, level);
  } else {
    console.log(\`[\${level.toUpperCase()}] \${message}\`);
  }
}

export function setUserContext(user: { id: string; email?: string }) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser(user);
  }
}

export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  }
}

export function startTransaction(name: string, operation: string) {
  if (process.env.NODE_ENV === 'production' && process.env.PERFORMANCE_MONITORING === 'true') {
    return Sentry.startTransaction({ name, op: operation });
  }
  return null;
}

export function finishTransaction(transaction: any) {
  if (transaction) {
    transaction.finish();
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(name: string): void {
    this.metrics.set(name, performance.now());
  }

  endTimer(name: string): number {
    const startTime = this.metrics.get(name);
    if (!startTime) {
      console.warn(\`Timer \${name} was not started\`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(name);

    // Log slow operations
    if (duration > 1000) {
      console.warn(\`Slow operation detected: \${name} took \${duration}ms\`);
      captureMessage(\`Slow operation: \${name} (\${duration}ms)\`, 'warning');
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

    // Log slow API calls
    if (duration > 2000) {
      captureMessage(\`Slow API call: \${method} \${endpoint} (\${duration}ms)\`, 'warning');
    }

    // Log API errors
    if (status >= 400) {
      captureMessage(\`API error: \${method} \${endpoint} returned \${status}\`, 'error');
    }

    // In production, you might want to send to external monitoring service
    if (process.env.NODE_ENV === 'production' && process.env.MONITORING_ENABLED === 'true') {
      // Example: Send to your monitoring service
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      }).catch(console.error);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
`;
      
      fs.writeFileSync('src/lib/monitoring.ts', monitoringContent);
      console.log('✅ Monitoring library created');
    }
  },
  {
    name: 'Metrics API Endpoint',
    check: () => {
      return fs.existsSync('src/app/api/metrics/route.ts');
    },
    setup: () => {
      console.log('📝 Creating metrics API endpoint...');
      
      const metricsDir = 'src/app/api/metrics';
      if (!fs.existsSync(metricsDir)) {
        fs.mkdirSync(metricsDir, { recursive: true });
      }
      
      const metricsContent = `import { NextRequest, NextResponse } from 'next/server';
import { captureError } from '@/lib/monitoring';

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();
    
    // Log the metric (in production, you might want to store in a time-series database)
    console.log('Custom metric received:', {
      timestamp: new Date().toISOString(),
      ...metric,
    });

    // In production, you might want to:
    // 1. Store metrics in a time-series database (InfluxDB, TimescaleDB)
    // 2. Send to external monitoring service (DataDog, New Relic)
    // 3. Aggregate and analyze for alerting

    return NextResponse.json({ success: true });
  } catch (error) {
    captureError(error as Error, {
      component: 'metrics-api',
      action: 'process-metric',
    });
    
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return basic system metrics
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV,
  };

  return NextResponse.json(metrics);
}
`;
      
      fs.writeFileSync(path.join(metricsDir, 'route.ts'), metricsContent);
      console.log('✅ Metrics API endpoint created');
    }
  },
  {
    name: 'Package.json Scripts',
    check: () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return packageJson.scripts['monitor:setup'];
    },
    setup: () => {
      console.log('📝 Adding monitoring scripts to package.json...');
      
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      packageJson.scripts = {
        ...packageJson.scripts,
        'monitor:setup': 'node scripts/setup-monitoring.js',
        'monitor:health': 'curl -f http://localhost:3000/api/health || exit 1',
        'monitor:test': 'npm run monitor:health && echo "✅ Monitoring setup verified"',
      };
      
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      console.log('✅ Monitoring scripts added to package.json');
    }
  }
];

// Run setup steps
async function runSetup() {
  console.log('🚀 Starting monitoring setup...\n');
  
  for (const step of setupSteps) {
    console.log(`🔍 Checking: ${step.name}`);
    
    if (step.check()) {
      console.log(`✅ ${step.name} - Already configured\n`);
    } else {
      console.log(`⚠️  ${step.name} - Needs setup`);
      step.setup();
      console.log('');
    }
  }
  
  console.log('🎉 Monitoring setup complete!\n');
  
  // Display next steps
  console.log('📋 Next Steps:');
  console.log('1. Sign up for Sentry at https://sentry.io');
  console.log('2. Create a new Next.js project in Sentry');
  console.log('3. Copy your DSN and add it to your environment variables');
  console.log('4. Install Sentry SDK: npm install @sentry/nextjs');
  console.log('5. Enable Vercel Analytics in your Vercel dashboard');
  console.log('6. Set up uptime monitoring with UptimeRobot or similar service');
  console.log('7. Test your setup: npm run monitor:test\n');
  
  console.log('📚 Documentation:');
  console.log('- Monitoring setup: docs/MONITORING_SETUP.md');
  console.log('- Deployment guide: docs/DEPLOYMENT_CHECKLIST.md');
  console.log('- API documentation: docs/API_DOCUMENTATION.md\n');
  
  console.log('🔗 Useful Links:');
  console.log('- Sentry: https://sentry.io');
  console.log('- Vercel Analytics: https://vercel.com/analytics');
  console.log('- UptimeRobot: https://uptimerobot.com');
  console.log('- Better Uptime: https://betteruptime.com\n');
}

// Run the setup
runSetup().catch(console.error);