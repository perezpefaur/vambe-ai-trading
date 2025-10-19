import { NextRequest, NextResponse } from 'next/server'
import { NotbankTradingClient } from '@/lib/services/notbank-client'
import { AITradingService } from '@/lib/services/ai-trader'

export async function POST(req: NextRequest) {
  try {
    const { symbol, side, quantity, useAI } = await req.json()

    if (!process.env.NOTBANK_API_PUBLIC_KEY || !process.env.NOTBANK_API_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Trading credentials not configured' },
        { status: 500 }
      )
    }

    const tradingClient = new NotbankTradingClient(
      process.env.NOTBANK_API_PUBLIC_KEY,
      process.env.NOTBANK_API_SECRET_KEY,
      process.env.NOTBANK_USER_ID || '',
      process.env.NOTBANK_ACCOUNT_ID ? parseInt(process.env.NOTBANK_ACCOUNT_ID) : undefined
    )

    if (useAI && process.env.OPENROUTER_API_KEY) {
      const aiService = new AITradingService(process.env.OPENROUTER_API_KEY)

      const portfolio = await tradingClient.getPortfolio()
      const marketData = await tradingClient.getMarketData([symbol])
      const recentTrades = await tradingClient.getRecentTrades(10)

      const signal = await aiService.analyzeTradingOpportunity(
        marketData,
        portfolio.positions,
        recentTrades
      )

      if (signal.action === 'hold') {
        return NextResponse.json({
          message: 'AI recommends holding',
          signal
        })
      }

      const riskMetrics = await aiService.evaluateRiskMetrics(portfolio, signal)

      if (riskMetrics.riskScore < 0.5) {
        return NextResponse.json({
          message: 'Trade rejected due to high risk',
          signal,
          riskMetrics
        })
      }

      const finalQuantity = Math.min(
        quantity || signal.suggestedQuantity || 0,
        riskMetrics.maxPositionSize / marketData[0].price
      )

      const trade = await tradingClient.executeTrade(
        symbol,
        signal.action as 'buy' | 'sell',
        finalQuantity,
        signal.targetPrice
      )

      return NextResponse.json({
        trade,
        signal,
        riskMetrics
      })
    } else {
      const trade = await tradingClient.executeTrade(symbol, side, quantity)
      return NextResponse.json({ trade })
    }
  } catch (error) {
    console.error('Trading execution error:', error)
    return NextResponse.json(
      { error: 'Failed to execute trade' },
      { status: 500 }
    )
  }
}