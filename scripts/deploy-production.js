#!/usr/bin/env node

/**
 * Production deployment script
 * Switches to production schema and runs migrations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting production deployment...');

try {
  // Backup current schema
  const currentSchema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  fs.writeFileSync('prisma/schema.backup.prisma', currentSchema);
  console.log('✅ Backed up current schema');

  // Copy production schema
  const prodSchema = fs.readFileSync('prisma/schema.prod.prisma', 'utf8');
  fs.writeFileSync('prisma/schema.prisma', prodSchema);
  console.log('✅ Switched to production schema');

  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Run migrations (only if DATABASE_URL is PostgreSQL)
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql')) {
    console.log('🗄️  Running database migrations...');
    execSync('npx prisma db push', { stdio: 'inherit' });
  }

  console.log('✅ Production deployment completed successfully!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  
  // Restore backup schema
  if (fs.existsSync('prisma/schema.backup.prisma')) {
    const backupSchema = fs.readFileSync('prisma/schema.backup.prisma', 'utf8');
    fs.writeFileSync('prisma/schema.prisma', backupSchema);
    console.log('🔄 Restored backup schema');
  }
  
  process.exit(1);
}