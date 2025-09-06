#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies that the Freelancian MVP deployment is working correctly
 * by testing all critical endpoints and functionality.
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  baseUrl: process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  retries: 3,
};

console.log(`🔍 Verifying deployment at: ${config.baseUrl}\n`);

// Test cases
const tests = [
  {
    name: 'Health Check',
    path: '/api/health',
    method: 'GET',
    expectedStatus: 200,
    validate: (data) => {
      return data.status === 'healthy' && 
             data.services && 
             data.services.database === 'healthy';
    }
  },
  {
    name: 'Homepage Load',
    path: '/',
    method: 'GET',
    expectedStatus: 200,
    validate: (html) => {
      return html.includes('Freelancian') && 
             html.includes('dashboard');
    }
  },
  {
    name: 'Dashboard Page',
    path: '/dashboard',
    method: 'GET',
    expectedStatus: 200,
    validate: (html) => {
      return html.includes('Total Income') || 
             html.includes('dashboard');
    }
  },
  {
    name: 'API - Get Entries',
    path: '/api/entries',
    method: 'GET',
    expectedStatus: 200,
    validate: (data) => {
      return data.success === true && 
             Array.isArray(data.data);
    }
  },
  {
    name: 'API - Dashboard Metrics',
    path: '/api/reports/dashboard',
    method: 'GET',
    expectedStatus: 200,
    validate: (data) => {
      return data.success === true && 
             data.data && 
             typeof data.data.totalIncome === 'number';
    }
  },
  {
    name: 'API - Trends Report',
    path: '/api/reports/trends',
    method: 'GET',
    expectedStatus: 200,
    validate: (data) => {
      return data.success === true && 
             Array.isArray(data.data);
    }
  },
  {
    name: 'Entry Form Page',
    path: '/entries/new',
    method: 'GET',
    expectedStatus: 200,
    validate: (html) => {
      return html.includes('form') || 
             html.includes('entry');
    }
  },
  {
    name: 'Reports Page',
    path: '/reports',
    method: 'GET',
    expectedStatus: 200,
    validate: (html) => {
      return html.includes('reports') || 
             html.includes('chart');
    }
  },
  {
    name: 'Import Page',
    path: '/import',
    method: 'GET',
    expectedStatus: 200,
    validate: (html) => {
      return html.includes('import') || 
             html.includes('CSV');
    }
  },
  {
    name: 'Entries List Page',
    path: '/entries',
    method: 'GET',
    expectedStatus: 200,
    validate: (html) => {
      return html.includes('entries') || 
             html.includes('search');
    }
  }
];

// HTTP request helper
function makeRequest(url, method = 'GET', timeout = config.timeout) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    
    const options = {
      method,
      timeout,
      headers: {
        'User-Agent': 'Freelancian-Deployment-Verifier/1.0',
        'Accept': 'text/html,application/json,*/*',
      }
    };
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          contentType: res.headers['content-type'] || ''
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Parse response data
function parseResponse(response) {
  if (response.contentType.includes('application/json')) {
    try {
      return JSON.parse(response.data);
    } catch (e) {
      return response.data;
    }
  }
  return response.data;
}

// Run a single test with retries
async function runTest(test, retryCount = 0) {
  const url = `${config.baseUrl}${test.path}`;
  
  try {
    const response = await makeRequest(url, test.method);
    const parsedData = parseResponse(response);
    
    // Check status code
    if (response.status !== test.expectedStatus) {
      throw new Error(`Expected status ${test.expectedStatus}, got ${response.status}`);
    }
    
    // Run custom validation if provided
    if (test.validate && !test.validate(parsedData)) {
      throw new Error('Custom validation failed');
    }
    
    return {
      success: true,
      status: response.status,
      responseTime: Date.now(),
      data: parsedData
    };
    
  } catch (error) {
    if (retryCount < config.retries) {
      console.log(`  ⚠️  Retry ${retryCount + 1}/${config.retries} for ${test.name}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return runTest(test, retryCount + 1);
    }
    
    return {
      success: false,
      error: error.message,
      status: error.status || 'unknown'
    };
  }
}

// Run all tests
async function runAllTests() {
  const results = [];
  let passed = 0;
  let failed = 0;
  
  console.log('🧪 Running deployment verification tests...\n');
  
  for (const test of tests) {
    process.stdout.write(`  🔍 ${test.name}... `);
    
    const startTime = Date.now();
    const result = await runTest(test);
    const duration = Date.now() - startTime;
    
    if (result.success) {
      console.log(`✅ (${duration}ms)`);
      passed++;
    } else {
      console.log(`❌ ${result.error} (${duration}ms)`);
      failed++;
    }
    
    results.push({
      ...test,
      ...result,
      duration
    });
  }
  
  return { results, passed, failed };
}

// Performance checks
async function runPerformanceChecks() {
  console.log('\n⚡ Running performance checks...\n');
  
  const performanceTests = [
    {
      name: 'Homepage Load Time',
      path: '/',
      threshold: 3000 // 3 seconds
    },
    {
      name: 'API Response Time',
      path: '/api/health',
      threshold: 1000 // 1 second
    },
    {
      name: 'Dashboard Load Time',
      path: '/dashboard',
      threshold: 4000 // 4 seconds (includes data loading)
    }
  ];
  
  for (const test of performanceTests) {
    process.stdout.write(`  ⚡ ${test.name}... `);
    
    const startTime = Date.now();
    try {
      await makeRequest(`${config.baseUrl}${test.path}`);
      const duration = Date.now() - startTime;
      
      if (duration <= test.threshold) {
        console.log(`✅ ${duration}ms (under ${test.threshold}ms)`);
      } else {
        console.log(`⚠️  ${duration}ms (over ${test.threshold}ms threshold)`);
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
}

// Security checks
async function runSecurityChecks() {
  console.log('\n🔒 Running security checks...\n');
  
  try {
    const response = await makeRequest(config.baseUrl);
    const headers = response.headers;
    
    const securityHeaders = [
      { name: 'X-Frame-Options', expected: 'DENY' },
      { name: 'X-Content-Type-Options', expected: 'nosniff' },
      { name: 'Referrer-Policy', expected: 'origin-when-cross-origin' }
    ];
    
    for (const header of securityHeaders) {
      const value = headers[header.name.toLowerCase()];
      if (value && value.includes(header.expected)) {
        console.log(`  ✅ ${header.name}: ${value}`);
      } else {
        console.log(`  ⚠️  ${header.name}: Missing or incorrect (expected: ${header.expected})`);
      }
    }
    
    // Check for HTTPS in production
    if (config.baseUrl.startsWith('https://')) {
      console.log('  ✅ HTTPS: Enabled');
    } else {
      console.log('  ⚠️  HTTPS: Not enabled (recommended for production)');
    }
    
  } catch (error) {
    console.log(`  ❌ Security check failed: ${error.message}`);
  }
}

// Database connectivity check
async function runDatabaseCheck() {
  console.log('\n🗄️  Running database connectivity check...\n');
  
  try {
    const response = await makeRequest(`${config.baseUrl}/api/health`);
    const data = parseResponse(response);
    
    if (data.services && data.services.database === 'healthy') {
      console.log('  ✅ Database: Connected and healthy');
      console.log(`  📊 Environment: ${data.environment || 'unknown'}`);
      console.log(`  🏷️  Version: ${data.version || 'unknown'}`);
    } else {
      console.log('  ❌ Database: Connection issues detected');
    }
  } catch (error) {
    console.log(`  ❌ Database check failed: ${error.message}`);
  }
}

// Generate report
function generateReport(testResults) {
  console.log('\n📊 Deployment Verification Report\n');
  console.log('=' .repeat(50));
  
  console.log(`\n📈 Test Results:`);
  console.log(`  ✅ Passed: ${testResults.passed}`);
  console.log(`  ❌ Failed: ${testResults.failed}`);
  console.log(`  📊 Total: ${testResults.results.length}`);
  console.log(`  🎯 Success Rate: ${Math.round((testResults.passed / testResults.results.length) * 100)}%`);
  
  if (testResults.failed > 0) {
    console.log(`\n❌ Failed Tests:`);
    testResults.results
      .filter(result => !result.success)
      .forEach(result => {
        console.log(`  • ${result.name}: ${result.error}`);
      });
  }
  
  console.log(`\n🌐 Deployment URL: ${config.baseUrl}`);
  console.log(`⏱️  Total Verification Time: ${Date.now() - startTime}ms`);
  
  // Overall status
  if (testResults.failed === 0) {
    console.log('\n🎉 Deployment verification PASSED! ✅');
    console.log('Your application is ready for production use.');
  } else if (testResults.failed <= 2) {
    console.log('\n⚠️  Deployment verification PASSED with warnings ⚠️');
    console.log('Some non-critical tests failed. Review and fix if needed.');
  } else {
    console.log('\n❌ Deployment verification FAILED ❌');
    console.log('Critical issues detected. Please fix before production use.');
    process.exit(1);
  }
}

// Main execution
async function main() {
  const startTime = Date.now();
  
  try {
    // Run all test suites
    const testResults = await runAllTests();
    await runPerformanceChecks();
    await runSecurityChecks();
    await runDatabaseCheck();
    
    // Generate final report
    generateReport(testResults);
    
  } catch (error) {
    console.error('\n❌ Verification failed with error:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Freelancian MVP Deployment Verification Script

Usage:
  node scripts/verify-deployment.js [options]

Options:
  --help, -h          Show this help message
  --url <url>         Override base URL for testing
  --timeout <ms>      Set request timeout (default: 10000ms)
  --retries <count>   Set retry count (default: 3)

Environment Variables:
  VERCEL_URL          Vercel deployment URL (auto-detected)
  BASE_URL            Override base URL for testing

Examples:
  node scripts/verify-deployment.js
  node scripts/verify-deployment.js --url https://my-app.vercel.app
  BASE_URL=https://my-app.com node scripts/verify-deployment.js
`);
  process.exit(0);
}

// Override config from command line
const urlIndex = process.argv.indexOf('--url');
if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
  config.baseUrl = process.argv[urlIndex + 1];
}

const timeoutIndex = process.argv.indexOf('--timeout');
if (timeoutIndex !== -1 && process.argv[timeoutIndex + 1]) {
  config.timeout = parseInt(process.argv[timeoutIndex + 1]);
}

const retriesIndex = process.argv.indexOf('--retries');
if (retriesIndex !== -1 && process.argv[retriesIndex + 1]) {
  config.retries = parseInt(process.argv[retriesIndex + 1]);
}

// Run the verification
main().catch(console.error);