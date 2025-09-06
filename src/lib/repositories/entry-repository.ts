import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { GetEntriesQuery } from '@/types/entry'

// Utility function to handle both Float (SQLite) and Decimal (PostgreSQL) types
function toNumber(value: number | any | null): number {
  if (value === null || value === undefined) return 0
  return typeof value === 'number' ? value : Number(value)
}

export class EntryRepository {
  // Get entries with filtering and pagination
  async findMany(query: GetEntriesQuery) {
    const {
      page = 1,
      limit = 50,
      kind,
      month,
      search,
      sortBy = 'docDate',
      sortOrder = 'desc',
      clientName,
      vendorName,
    } = query

    const offset = (page - 1) * limit

    // Build where clause
    const where: Prisma.EntryWhereInput = {}

    if (kind) {
      where.kind = kind
    }

    if (month) {
      const startDate = new Date(`${month}-01`)
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      where.docDate = {
        gte: startDate,
        lte: endDate,
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { clientName: { contains: search } },
        { vendorName: { contains: search } },
        { productService: { contains: search } },
        { project: { contains: search } },
      ]
    }

    if (clientName) {
      where.clientName = { contains: clientName }
    }

    if (vendorName) {
      where.vendorName = { contains: vendorName }
    }

    // Build order by clause
    const orderBy: Prisma.EntryOrderByWithRelationInput = {}
    if (sortBy === 'docDate') {
      orderBy.docDate = sortOrder
    } else if (sortBy === 'totalNetThb') {
      orderBy.totalNetThb = sortOrder
    } else if (sortBy === 'title') {
      orderBy.title = sortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    }

    // Execute queries in parallel
    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.entry.count({ where }),
    ])

    return {
      entries,
      total,
      hasMore: offset + limit < total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // Get single entry by ID
  async findById(id: string) {
    return prisma.entry.findUnique({
      where: { id },
    })
  }

  // Create new entry
  async create(data: Prisma.EntryCreateInput) {
    return prisma.entry.create({ data })
  }

  // Update entry
  async update(id: string, data: Prisma.EntryUpdateInput) {
    return prisma.entry.update({
      where: { id },
      data,
    })
  }

  // Delete entry
  async delete(id: string) {
    return prisma.entry.delete({
      where: { id },
    })
  }

  // Get recent entries for dashboard
  async findRecent(limit: number = 10) {
    return prisma.entry.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  // Get entries for specific month
  async findByMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    return prisma.entry.findMany({
      where: {
        docDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { docDate: 'desc' },
    })
  }

  // Get monthly summary statistics
  async getMonthlyStats(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const entries = await prisma.entry.findMany({
      where: {
        docDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        kind: true,
        totalNetThb: true,
      },
    })

    let totalIncome = 0
    let totalExpenses = 0
    let incomeCount = 0
    let expenseCount = 0

    entries.forEach(entry => {
      const amount = toNumber(entry.totalNetThb)
      
      if (entry.kind === 'income') {
        totalIncome += amount
        incomeCount++
      } else if (entry.kind === 'expense') {
        totalExpenses += Math.abs(amount)
        expenseCount++
      }
    })

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netAmount: Math.round((totalIncome - totalExpenses) * 100) / 100,
      entryCount: {
        income: incomeCount,
        expense: expenseCount,
        total: incomeCount + expenseCount,
      },
    }
  }

  // Get trend data for multiple months
  async getTrendData(months: number = 6) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(endDate.getMonth() - months + 1)
    startDate.setDate(1)

    const entries = await prisma.entry.findMany({
      where: {
        docDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        kind: true,
        totalNetThb: true,
        docDate: true,
      },
      orderBy: { docDate: 'asc' },
    })

    // Group by month
    const monthlyData: Record<string, {
      totalIncome: number
      totalExpenses: number
      entryCount: number
    }> = {}

    entries.forEach(entry => {
      if (!entry.docDate) return
      
      const monthKey = `${entry.docDate.getFullYear()}-${String(entry.docDate.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          totalIncome: 0,
          totalExpenses: 0,
          entryCount: 0,
        }
      }

      const amount = toNumber(entry.totalNetThb)
      monthlyData[monthKey].entryCount++

      if (entry.kind === 'income') {
        monthlyData[monthKey].totalIncome += amount
      } else if (entry.kind === 'expense') {
        monthlyData[monthKey].totalExpenses += Math.abs(amount)
      }
    })

    // Convert to array format
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      totalIncome: Math.round(data.totalIncome * 100) / 100,
      totalExpenses: Math.round(data.totalExpenses * 100) / 100,
      netAmount: Math.round((data.totalIncome - data.totalExpenses) * 100) / 100,
      entryCount: data.entryCount,
    }))
  }

  // Get unique client names for filtering
  async getUniqueClients() {
    const result = await prisma.entry.findMany({
      where: {
        clientName: { not: null },
      },
      select: {
        clientName: true,
      },
      distinct: ['clientName'],
      orderBy: {
        clientName: 'asc',
      },
    })

    return result
      .map(entry => entry.clientName)
      .filter((name): name is string => name !== null)
  }

  // Get unique vendor names for filtering
  async getUniqueVendors() {
    const result = await prisma.entry.findMany({
      where: {
        vendorName: { not: null },
      },
      select: {
        vendorName: true,
      },
      distinct: ['vendorName'],
      orderBy: {
        vendorName: 'asc',
      },
    })

    return result
      .map(entry => entry.vendorName)
      .filter((name): name is string => name !== null)
  }

  // Check if entry exists
  async exists(id: string): Promise<boolean> {
    const count = await prisma.entry.count({
      where: { id },
    })
    return count > 0
  }

  // Bulk create entries (for CSV import)
  async createMany(entries: Prisma.EntryCreateManyInput[]) {
    return prisma.entry.createMany({
      data: entries,
    })
  }

  // Get database health status
  async healthCheck(): Promise<boolean> {
    try {
      await prisma.entry.count()
      return true
    } catch {
      return false
    }
  }

  // Get current month dashboard metrics with optimized query
  async getCurrentMonthDashboard() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const entries = await prisma.entry.findMany({
      where: {
        docDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        kind: true,
        totalNetThb: true,
      },
    })

    return this.calculateMetricsFromEntries(entries)
  }

  // Get dashboard metrics for any date range
  async getDashboardMetrics(startDate: Date, endDate: Date) {
    const entries = await prisma.entry.findMany({
      where: {
        docDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        kind: true,
        totalNetThb: true,
      },
    })

    return this.calculateMetricsFromEntries(entries)
  }

  // Helper method to calculate metrics from entries
  private calculateMetricsFromEntries(entries: Array<{ kind: string; totalNetThb: number | any | null }>) {
    let totalIncome = 0
    let totalExpenses = 0
    let incomeCount = 0
    let expenseCount = 0

    entries.forEach(entry => {
      const amount = toNumber(entry.totalNetThb)
      
      if (entry.kind === 'income') {
        totalIncome += amount
        incomeCount++
      } else if (entry.kind === 'expense') {
        totalExpenses += Math.abs(amount)
        expenseCount++
      }
    })

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netAmount: Math.round((totalIncome - totalExpenses) * 100) / 100,
      entryCount: {
        income: incomeCount,
        expense: expenseCount,
        total: incomeCount + expenseCount,
      },
    }
  }

  // Get aggregated data for multiple months efficiently
  async getMonthlyAggregates(months: number = 6) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(endDate.getMonth() - months + 1)
    startDate.setDate(1)

    // Use raw query for better performance with aggregation
    const result = await prisma.$queryRaw<Array<{
      month: string
      kind: string
      total_income: number
      total_expenses: number
      entry_count: number
    }>>`
      SELECT 
        strftime('%Y-%m', doc_date) as month,
        kind,
        SUM(CASE WHEN kind = 'income' THEN COALESCE(total_net_thb, 0) ELSE 0 END) as total_income,
        SUM(CASE WHEN kind = 'expense' THEN ABS(COALESCE(total_net_thb, 0)) ELSE 0 END) as total_expenses,
        COUNT(*) as entry_count
      FROM entries 
      WHERE doc_date >= ${startDate.toISOString()} 
        AND doc_date <= ${endDate.toISOString()}
        AND doc_date IS NOT NULL
      GROUP BY strftime('%Y-%m', doc_date), kind
      ORDER BY month ASC
    `

    // Process the raw results into the expected format
    const monthlyData: Record<string, {
      totalIncome: number
      totalExpenses: number
      entryCount: number
    }> = {}

    result.forEach(row => {
      if (!monthlyData[row.month]) {
        monthlyData[row.month] = {
          totalIncome: 0,
          totalExpenses: 0,
          entryCount: 0,
        }
      }

      if (row.kind === 'income') {
        monthlyData[row.month].totalIncome += Number(row.total_income)
        monthlyData[row.month].entryCount += Number(row.entry_count)
      } else if (row.kind === 'expense') {
        monthlyData[row.month].totalExpenses += Number(row.total_expenses)
        monthlyData[row.month].entryCount += Number(row.entry_count)
      }
    })

    // Convert to array format and ensure all months are represented
    const monthsArray: Array<{
      month: string
      totalIncome: number
      totalExpenses: number
      netAmount: number
      entryCount: number
    }> = []

    for (let i = 0; i < months; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - months + 1 + i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const data = monthlyData[monthKey] || {
        totalIncome: 0,
        totalExpenses: 0,
        entryCount: 0,
      }

      monthsArray.push({
        month: monthKey,
        totalIncome: Math.round(data.totalIncome * 100) / 100,
        totalExpenses: Math.round(data.totalExpenses * 100) / 100,
        netAmount: Math.round((data.totalIncome - data.totalExpenses) * 100) / 100,
        entryCount: data.entryCount,
      })
    }

    return monthsArray
  }
}

// Export singleton instance
export const entryRepository = new EntryRepository()