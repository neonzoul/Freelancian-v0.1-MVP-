'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { clsx } from 'clsx'

interface MetricsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  variant: 'income' | 'expense' | 'net'
  isLoading?: boolean
  className?: string
}

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (end === 0) {
      setCount(0)
      return
    }
    
    let startTime: number
    let animationFrame: number
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(end * easeOutQuart))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration])
  
  return count
}

// Format Thai Baht currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function MetricsCard({ 
  title, 
  value, 
  icon, 
  variant, 
  isLoading = false,
  className 
}: MetricsCardProps) {
  const animatedValue = useAnimatedCounter(Math.abs(value), 1200)
  
  const variantStyles = {
    income: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
      accentColor: 'border-green-200',
    },
    expense: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
      accentColor: 'border-red-200',
    },
    net: {
      iconBg: value >= 0 ? 'bg-blue-100' : 'bg-orange-100',
      iconColor: value >= 0 ? 'text-blue-600' : 'text-orange-600',
      valueColor: value >= 0 ? 'text-blue-600' : 'text-orange-600',
      accentColor: value >= 0 ? 'border-blue-200' : 'border-orange-200',
    },
  }
  
  const styles = variantStyles[variant]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      <Card 
        hover 
        variant="elevated" 
        className={clsx(
          'relative overflow-hidden border-l-4 transition-all duration-300',
          styles.accentColor
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600 mb-1">
                {title}
              </p>
              
              {isLoading ? (
                <div className="h-8 bg-neutral-200 rounded animate-pulse mb-2" />
              ) : (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className={clsx(
                    'text-2xl font-bold mb-2',
                    styles.valueColor
                  )}
                >
                  {value < 0 && '-'}
                  {formatCurrency(animatedValue)}
                </motion.div>
              )}
              
              <div className="flex items-center text-xs text-neutral-500">
                <span>Current month</span>
              </div>
            </div>
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
              className={clsx(
                'w-12 h-12 rounded-full flex items-center justify-center',
                styles.iconBg
              )}
            >
              <div className={clsx('w-6 h-6', styles.iconColor)}>
                {icon}
              </div>
            </motion.div>
          </div>
        </CardContent>
        
        {/* Subtle background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <div className={clsx(
            'w-full h-full rounded-full transform translate-x-16 -translate-y-16',
            styles.iconBg
          )} />
        </div>
      </Card>
    </motion.div>
  )
}