'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { MonthlyTrend } from '@/types'
import { clsx } from 'clsx'

interface MonthlyChartProps {
  trends: MonthlyTrend[]
  isLoading?: boolean
  selectedPeriod: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const income = payload.find(p => p.dataKey === 'totalIncome')?.value || 0
  const expenses = payload.find(p => p.dataKey === 'totalExpenses')?.value || 0
  const net = payload.find(p => p.dataKey === 'netAmount')?.value || 0
  const entryCount = payload.find(p => p.dataKey === 'entryCount')?.value || 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white p-4 rounded-lg shadow-lg border border-neutral-200"
    >
      <div className="font-semibold text-neutral-900 mb-3 border-b border-neutral-100 pb-2">
        {label}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-neutral-600">Income</span>
          </div>
          <span className="font-semibold text-green-600">
            {formatCurrency(income)}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-neutral-600">Expenses</span>
          </div>
          <span className="font-semibold text-red-600">
            {formatCurrency(Math.abs(expenses))}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <div className={clsx(
              'w-3 h-3 rounded-full',
              net >= 0 ? 'bg-blue-500' : 'bg-orange-500'
            )} />
            <span className="text-sm text-neutral-600">Net Amount</span>
          </div>
          <span className={clsx(
            'font-semibold',
            net >= 0 ? 'text-blue-600' : 'text-orange-600'
          )}>
            {formatCurrency(net)}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-4 text-xs text-neutral-500 pt-1">
          <span>Total Entries</span>
          <span>{entryCount}</span>
        </div>
      </div>
    </motion.div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="w-48 h-6 bg-neutral-200 rounded animate-pulse" />
          <div className="w-32 h-4 bg-neutral-200 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-neutral-100 rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}

export function MonthlyChart({ trends, isLoading, selectedPeriod }: MonthlyChartProps) {
  if (isLoading) {
    return <ChartSkeleton />
  }

  if (!trends || trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-neutral-900">
            Monthly Trends
          </h3>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No Chart Data
              </h3>
              <p className="text-neutral-600">
                No financial data available for the selected period.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format data for the chart
  const chartData = trends.map(trend => ({
    ...trend,
    // Format month for display (e.g., "2024-01" -> "Jan 2024")
    monthDisplay: new Date(trend.month + '-01').toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    }),
  }))

  // Calculate max values for better scaling
  const maxIncome = Math.max(...trends.map(t => t.totalIncome))
  const maxExpenses = Math.max(...trends.map(t => Math.abs(t.totalExpenses)))
  const maxValue = Math.max(maxIncome, maxExpenses)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card hover variant="elevated">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">
                Monthly Income vs Expenses
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600">
                Financial trends over the last {selectedPeriod} months
              </p>
            </div>
            
            <div className="text-xs text-neutral-500">
              {trends.length} months of data
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-64 sm:h-80 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  opacity={0.5}
                />
                
                <XAxis
                  dataKey="monthDisplay"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  interval="preserveStartEnd"
                />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
                  width={60}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '14px',
                  }}
                />
                
                {/* Reference line at zero */}
                <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="2 2" />
                
                {/* Income area */}
                <Area
                  type="monotone"
                  dataKey="totalIncome"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#incomeGradient)"
                  name="Income"
                  animationDuration={1500}
                  animationBegin={200}
                />
                
                {/* Expenses bars */}
                <Bar
                  dataKey="totalExpenses"
                  fill="#ef4444"
                  name="Expenses"
                  radius={[2, 2, 0, 0]}
                  animationDuration={1200}
                  animationBegin={400}
                />
                
                {/* Net amount line */}
                <Area
                  type="monotone"
                  dataKey="netAmount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                  name="Net Amount"
                  animationDuration={1000}
                  animationBegin={600}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart insights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-6 pt-4 border-t border-neutral-100"
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="text-center">
                <div className="font-semibold text-green-600">
                  ฿{maxIncome.toLocaleString()}
                </div>
                <div className="text-neutral-600">Highest Income</div>
              </div>
              
              <div className="text-center">
                <div className="font-semibold text-red-600">
                  ฿{maxExpenses.toLocaleString()}
                </div>
                <div className="text-neutral-600">Highest Expenses</div>
              </div>
              
              <div className="text-center">
                <div className={clsx(
                  'font-semibold',
                  trends[trends.length - 1]?.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'
                )}>
                  ฿{Math.abs(trends[trends.length - 1]?.netAmount || 0).toLocaleString()}
                </div>
                <div className="text-neutral-600">Latest Net</div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}