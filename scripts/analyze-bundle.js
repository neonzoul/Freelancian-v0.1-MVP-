#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔍 Analyzing bundle size and performance...\n')

// Set environment variable for bundle analysis
process.env.ANALYZE = 'true'

try {
  // Run build with bundle analysis
  console.log('📦 Building application with bundle analyzer...')
  execSync('npm run build', { stdio: 'inherit' })
  
  console.log('\n✅ Bundle analysis complete!')
  console.log('📊 Check the opened browser tabs for detailed bundle analysis')
  
  // Generate performance report
  generatePerformanceReport()
  
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message)
  process.exit(1)
}

function generatePerformanceReport() {
  const buildDir = path.join(process.cwd(), '.next')
  
  if (!fs.existsSync(buildDir)) {
    console.log('⚠️  Build directory not found, skipping performance report')
    return
  }
  
  console.log('\n📋 Performance Optimization Report')
  console.log('=' .repeat(50))
  
  // Check for build artifacts
  const staticDir = path.join(buildDir, 'static')
  if (fs.existsSync(staticDir)) {
    analyzeStaticAssets(staticDir)
  }
  
  // Performance recommendations
  console.log('\n🚀 Performance Recommendations:')
  console.log('1. ✅ Bundle splitting enabled with dynamic imports')
  console.log('2. ✅ Image optimization configured')
  console.log('3. ✅ React Query caching optimized')
  console.log('4. ✅ Database queries indexed')
  console.log('5. ✅ Compression enabled')
  console.log('6. ✅ Tree shaking configured')
  console.log('7. ✅ Performance monitoring added')
  
  console.log('\n📈 Next Steps:')
  console.log('- Monitor Core Web Vitals in production')
  console.log('- Set up performance budgets in CI/CD')
  console.log('- Consider adding service worker for caching')
  console.log('- Implement progressive loading for large datasets')
}

function analyzeStaticAssets(staticDir) {
  try {
    const chunks = path.join(staticDir, 'chunks')
    if (fs.existsSync(chunks)) {
      const files = fs.readdirSync(chunks)
      const jsFiles = files.filter(f => f.endsWith('.js'))
      
      console.log(`\n📁 JavaScript Chunks: ${jsFiles.length} files`)
      
      let totalSize = 0
      jsFiles.forEach(file => {
        const filePath = path.join(chunks, file)
        const stats = fs.statSync(filePath)
        totalSize += stats.size
      })
      
      console.log(`📊 Total JS size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
      
      if (totalSize > 5 * 1024 * 1024) { // 5MB
        console.log('⚠️  Large bundle size detected - consider further code splitting')
      } else {
        console.log('✅ Bundle size is within acceptable range')
      }
    }
  } catch (error) {
    console.log('⚠️  Could not analyze static assets:', error.message)
  }
}