import OpenAI from 'openai'
import { TradingSignal, MarketData, Position, Trade } from '@/lib/types'

export class AITradingService {
  private openai: OpenAI

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Vambe AI Trading'
      }
    })
  }

  async analyzeTradingOpportunity(
    marketData: MarketData[],
    currentPositions: Position[],
    recentTrades: Trade[]
  ): Promise<TradingSignal> {
    const prompt = this.buildAnalysisPrompt(marketData, currentPositions, recentTrades)

    try {
      const response = await this.openai.chat.completions.create({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: `You are an expert cryptocurrency trading AI. Analyze market data and provide trading signals with high confidence. Focus on risk management and profitable opportunities. Always respond in JSON format.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from AI')

      return JSON.parse(content) as TradingSignal
    } catch (error) {
      console.error('AI Trading Analysis Error:', error)
      return {
        symbol: marketData[0]?.symbol || 'BTC',
        action: 'hold',
        confidence: 0,
        reasoning: 'Error analyzing market conditions'
      }
    }
  }

  private buildAnalysisPrompt(
    marketData: MarketData[],
    positions: Position[],
    recentTrades: Trade[]
  ): string {
    return `
    Analyze the following cryptocurrency market data and provide a trading signal:

    Market Data:
    ${JSON.stringify(marketData, null, 2)}

    Current Positions:
    ${JSON.stringify(positions, null, 2)}

    Recent Trades (last 10):
    ${JSON.stringify(recentTrades.slice(-10), null, 2)}

    Please provide a trading signal with the following JSON structure:
    {
      "symbol": "string (crypto symbol to trade)",
      "action": "buy | sell | hold",
      "confidence": "number (0-1, where 1 is highest confidence)",
      "reasoning": "string (detailed explanation of the decision)",
      "suggestedQuantity": "number (optional, suggested trade size)",
      "targetPrice": "number (optional, target price for the trade)",
      "stopLoss": "number (optional, stop loss price)"
    }

    Consider:
    1. Market trends and momentum
    2. Current portfolio exposure
    3. Risk management (max 5% of portfolio per trade)
    4. Recent trade performance
    5. Support and resistance levels
    `
  }

  async evaluateRiskMetrics(
    portfolio: { totalValue: number; positions: Position[] },
    proposedTrade: TradingSignal
  ): Promise<{
    riskScore: number
    maxPositionSize: number
    recommendation: string
  }> {
    const maxRiskPerTrade = portfolio.totalValue * 0.05
    const currentExposure = portfolio.positions.reduce((acc, pos) => acc + pos.notional, 0)
    const exposureRatio = currentExposure / portfolio.totalValue

    const riskScore = Math.min(
      1,
      (1 - exposureRatio) * proposedTrade.confidence
    )

    return {
      riskScore,
      maxPositionSize: maxRiskPerTrade,
      recommendation: riskScore > 0.6 ? 'Proceed with trade' : 'Consider reducing position size'
    }
  }
}