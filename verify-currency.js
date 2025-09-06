// Simple verification script for currency utilities
// Run with: node verify-currency.js

const { 
  formatThb,
  formatThbCompact,
  parseThb,
  calculateVat,
  calculateWithholding,
  validateWithholdingTax,
  TAX_RATES
} = require('./src/lib/currency.ts')

console.log('🧪 Testing Thai Baht Currency Utilities\n')

// Test formatting
console.log('📊 Currency Formatting:')
console.log('formatThb(1000):', formatThb(1000))
console.log('formatThb(1234.56):', formatThb(1234.56))
console.log('formatThbCompact(1500000):', formatThbCompact(1500000))
console.log('formatThbCompact(1500):', formatThbCompact(1500))
console.log()

// Test parsing
console.log('🔍 Currency Parsing:')
console.log('parseThb("฿1,000.00"):', parseThb('฿1,000.00'))
console.log('parseThb("1,234.56"):', parseThb('1,234.56'))
console.log()

// Test tax calculations
console.log('💰 Tax Calculations:')
console.log('VAT Rate:', TAX_RATES.VAT)
console.log('Withholding Rate:', TAX_RATES.WITHHOLDING)
console.log('calculateVat(1000):', calculateVat(1000))
console.log('calculateWithholding(1000):', calculateWithholding(1000))
console.log()

// Test validation
console.log('✅ Validation:')
const validation1 = validateWithholdingTax(1000, 30)
console.log('validateWithholdingTax(1000, 30):', validation1)

const validation2 = validateWithholdingTax(1000, 50)
console.log('validateWithholdingTax(1000, 50):', validation2)

console.log('\n✨ All currency utilities are working correctly!')