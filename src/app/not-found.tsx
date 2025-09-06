import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { fadeInUp, staggerChildren } from '@/lib/animations'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="max-w-lg w-full text-center"
      >
        {/* 404 Illustration */}
        <motion.div
          variants={fadeInUp}
          className="mb-8"
        >
          <div className="relative">
            <div className="text-8xl font-bold text-primary-200 select-none">
              404
            </div>
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-secondary-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29.82-5.877 2.172M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-neutral-600 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-neutral-500">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div 
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild variant="primary" size="lg">
            <Link href="/">
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              Go Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <Link href="/entries">
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
              </svg>
              View Entries
            </Link>
          </Button>
        </motion.div>

        {/* Help Links */}
        <motion.div 
          variants={fadeInUp}
          className="mt-12 pt-8 border-t border-neutral-200"
        >
          <p className="text-sm text-neutral-500 mb-4">
            Need help? Try these popular pages:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              href="/entries/new" 
              className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
            >
              Add Entry
            </Link>
            <Link 
              href="/reports" 
              className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
            >
              Reports
            </Link>
            <Link 
              href="/import" 
              className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
            >
              Import Data
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}