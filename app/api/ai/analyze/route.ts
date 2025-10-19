import { NextRequest, NextResponse } from 'next/server'
import { AITradingService } from '@/lib/services/ai-trader'
import { NotbankTradingClient } from '@/lib/services/notbank-client'

export async function POST(req: NextRequest) {
  try {
    const { symbols } = await req.json()

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    if (!process.env.NOTBANK_API_PUBLIC_KEY || !process.env.NOTBANK_API_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Trading credentials not configured' },
        { status: 500 }
      )
    }

    const aiService = new AITradingService(process.env.OPENROUTER_API_KEY)
    const tradingClient = new NotbankTradingClient(
      process.env.NOTBANK_API_PUBLIC_KEY,
      process.env.NOTBANK_API_SECRET_KEY,
      process.env.NOTBANK_USER_ID || '',
      process.env.NOTBANK_ACCOUNT_ID ? parseInt(process.env.NOTBANK_ACCOUNT_ID) : undefined
    )

    const marketData = await tradingClient.getMarketData(symbols || ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'])
    const portfolio = await tradingClient.getPortfolio()
    const recentTrades = await tradingClient.getRecentTrades(20)

    const signal = await aiService.analyzeTradingOpportunity(
      marketData,
      portfolio.positions,
      recentTrades
    )

    const riskMetrics = await aiService.evaluateRiskMetrics(portfolio, signal)

    return NextResponse.json({
      signal,
      riskMetrics,
      marketData
    })
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze market' },
      { status: 500 }
    )
  }
}