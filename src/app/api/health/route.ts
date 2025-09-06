import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    },
    message: 'Freelancian MVP API is running',
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
  })
}