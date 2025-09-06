#!/usr/bin/env node

/**
 * Development setup script
 * Switches to development schema
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🛠️  Setting up development environment...');

try {
  // Copy development schema
  const devSchema = fs.readFileSync('prisma/schema.dev.prisma', 'utf8');
  fs.writeFileSync('prisma/schema.prisma', devSchema);
  console.log('✅ Switched to development schema');

  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push schema to development database
  console.log('🗄️  Setting up development database...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('✅ Development environment setup completed!');
} catch (error) {
  console.error('❌ Development setup failed:', error.message);
  process.exit(1);
}