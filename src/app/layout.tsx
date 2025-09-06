import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { SkipLink } from '@/components/ui/SkipLink'
import { AccessibilityButton } from '@/components/accessibility/AccessibilitySettings'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Freelancian MVP - Thai Freelancer Financial Tracker',
  description: 'Beautiful financial tracking for Thai freelancers with VAT and WHT calculations',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Freelancian',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0284c7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#0284c7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Freelancian" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={inter.className}>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#navigation">Skip to navigation</SkipLink>
        <Providers>
          {children}
          <AccessibilityButton />
        </Providers>
      </body>
    </html>
  )
}