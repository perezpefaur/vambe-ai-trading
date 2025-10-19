import { NextRequest, NextResponse } from 'next/server'
import { NotbankTradingClient } from '@/lib/services/notbank-client'

export async function GET(req: NextRequest) {
  try {
    if (!process.env.NOTBANK_API_PUBLIC_KEY || !process.env.NOTBANK_API_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Trading credentials not configured' },
        { status: 500 }
      )
    }

    const tradingClient = new NotbankTradingClient(
      process.env.NOTBANK_API_PUBLIC_KEY,
      process.env.NOTBANK_API_SECRET_KEY,
      process.env.NOTBANK_USER_ID || ''
    )

    const portfolio = await tradingClient.getPortfolio()
    const recentTrades = await tradingClient.getRecentTrades(50)

    return NextResponse.json({
      portfolio,
      recentTrades
    })
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}