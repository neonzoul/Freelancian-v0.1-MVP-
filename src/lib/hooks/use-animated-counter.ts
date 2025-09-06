'use client'

import { useEffect, useState, useRef } from 'react'

interface UseAnimatedCounterOptions {
  duration?: number
  delay?: number
  easing?: (t: number) => number
  onComplete?: () => void
}

// Easing functions
const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeIn: (t: number) => t * t * t,
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeOutBack: (t: number) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  }
}

export function useAnimatedCounter(
  end: number,
  options: UseAnimatedCounterOptions = {}
) {
  const {
    duration = 1000,
    delay = 0,
    easing = easingFunctions.easeOutQuart,
    onComplete
  } = options

  const [count, setCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()

  useEffect(() => {
    if (end === 0) {
      setCount(0)
      setIsAnimating(false)
      return
    }

    const startAnimation = () => {
      setIsAnimating(true)
      startTimeRef.current = undefined

      const animate = (currentTime: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = currentTime
        }

        const elapsed = currentTime - startTimeRef.current
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easing(progress)
        
        setCount(Math.floor(end * easedProgress))

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
          onComplete?.()
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    const timeoutId = setTimeout(startAnimation, delay)

    return () => {
      clearTimeout(timeoutId)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [end, duration, delay, easing, onComplete])

  return { count, isAnimating }
}

// Hook for animating multiple counters with staggered delays
export function useStaggeredCounters(
  values: number[],
  options: UseAnimatedCounterOptions & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 100, ...counterOptions } = options
  
  return values.map((value, index) => 
    useAnimatedCounter(value, {
      ...counterOptions,
      delay: (counterOptions.delay || 0) + (index * staggerDelay)
    })
  )
}

// Hook for percentage animations
export function useAnimatedPercentage(
  percentage: number,
  options: UseAnimatedCounterOptions = {}
) {
  const { count, isAnimating } = useAnimatedCounter(percentage * 100, options)
  return { 
    percentage: count / 100, 
    displayValue: Math.round(count),
    isAnimating 
  }
}

// Hook for currency animations
export function useAnimatedCurrency(
  amount: number,
  options: UseAnimatedCounterOptions = {}
) {
  const { count, isAnimating } = useAnimatedCounter(Math.abs(amount), options)
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return {
    count,
    formattedValue: formatCurrency(count),
    isAnimating,
    isNegative: amount < 0
  }
}