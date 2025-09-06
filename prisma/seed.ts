import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.entry.deleteMany()
  console.log('🗑️  Cleared existing entries')

  // Sample income entries
  const incomeEntries = [
    {
      kind: 'income',
      title: 'Voice Over Project - Commercial Ad',
      docDate: new Date('2024-01-15'),
      transferDate: new Date('2024-01-20'),
      clientName: 'ABC Marketing Agency',
      productService: 'Voice Over Recording',
      priceGrossThb: 7000.00,
      vatThb: 490.00, // 7% VAT
      withholdingThb: 210.00, // 3% WHT
      commissionThb: 0.00,
      totalNetThb: 7280.00, // 7000 + 490 - 210
      project: 'Q1 2024 Campaigns',
      invoiceNo: 'INV-2024-001',
      remark: 'Commercial ad for new product launch',
    },
    {
      kind: 'income',
      title: 'Website Content Writing',
      docDate: new Date('2024-01-22'),
      transferDate: new Date('2024-01-25'),
      clientName: 'Tech Startup Co.',
      productService: 'Content Writing',
      priceGrossThb: 12000.00,
      vatThb: 840.00, // 7% VAT
      withholdingThb: 360.00, // 3% WHT
      commissionThb: 0.00,
      totalNetThb: 12480.00, // 12000 + 840 - 360
      project: 'Website Redesign',
      invoiceNo: 'INV-2024-002',
      remark: 'Homepage and about page content',
    },
    {
      kind: 'income',
      title: 'Podcast Editing Services',
      docDate: new Date('2024-02-05'),
      transferDate: new Date('2024-02-08'),
      clientName: 'Podcast Network Ltd.',
      productService: 'Audio Editing',
      priceGrossThb: 5500.00,
      vatThb: 385.00, // 7% VAT
      withholdingThb: 165.00, // 3% WHT
      commissionThb: 0.00,
      totalNetThb: 5720.00, // 5500 + 385 - 165
      project: 'Monthly Podcast Series',
      invoiceNo: 'INV-2024-003',
      remark: '4 episodes edited and mastered',
    },
  ]

  // Sample expense entries
  const expenseEntries = [
    {
      kind: 'expense',
      title: 'Professional Microphone',
      docDate: new Date('2024-01-10'),
      transferDate: new Date('2024-01-10'),
      vendorName: 'Audio Equipment Store',
      productService: 'Recording Equipment',
      priceGrossThb: 8500.00,
      vatThb: 595.00, // 7% VAT
      withholdingThb: 0.00,
      commissionThb: 0.00,
      totalNetThb: 9095.00, // 8500 + 595
      project: 'Studio Upgrade',
      invoiceNo: 'REC-2024-001',
      remark: 'Shure SM7B microphone for voice recording',
    },
    {
      kind: 'expense',
      title: 'Adobe Creative Suite Subscription',
      docDate: new Date('2024-01-01'),
      transferDate: new Date('2024-01-01'),
      vendorName: 'Adobe Systems',
      productService: 'Software Subscription',
      priceGrossThb: 1680.00,
      vatThb: 117.60, // 7% VAT
      withholdingThb: 0.00,
      commissionThb: 0.00,
      totalNetThb: 1797.60, // 1680 + 117.60
      project: 'Monthly Tools',
      invoiceNo: 'SUB-2024-001',
      remark: 'Monthly subscription for design and video editing',
    },
    {
      kind: 'expense',
      title: 'Co-working Space Rental',
      docDate: new Date('2024-02-01'),
      transferDate: new Date('2024-02-01'),
      vendorName: 'Creative Hub Bangkok',
      productService: 'Office Space',
      priceGrossThb: 3500.00,
      vatThb: 245.00, // 7% VAT
      withholdingThb: 0.00,
      commissionThb: 0.00,
      totalNetThb: 3745.00, // 3500 + 245
      project: 'Monthly Workspace',
      invoiceNo: 'RENT-2024-001',
      remark: 'Monthly desk rental with meeting room access',
    },
  ]

  // Insert income entries
  for (const entry of incomeEntries) {
    await prisma.entry.create({ data: entry })
  }
  console.log(`✅ Created ${incomeEntries.length} income entries`)

  // Insert expense entries
  for (const entry of expenseEntries) {
    await prisma.entry.create({ data: entry })
  }
  console.log(`✅ Created ${expenseEntries.length} expense entries`)

  // Display summary
  const totalEntries = await prisma.entry.count()
  const incomeCount = await prisma.entry.count({ where: { kind: 'income' } })
  const expenseCount = await prisma.entry.count({ where: { kind: 'expense' } })

  console.log('\n📊 Database seeding completed!')
  console.log(`Total entries: ${totalEntries}`)
  console.log(`Income entries: ${incomeCount}`)
  console.log(`Expense entries: ${expenseCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })