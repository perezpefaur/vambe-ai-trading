'use client'

import { useEffect, useState } from 'react'
import { PortfolioOverview } from '@/components/dashboard/portfolio-overview'
import { TradesList } from '@/components/dashboard/trades-list'
import { PositionsGrid } from '@/components/dashboard/positions-grid'
import { PortfolioChart } from '@/components/dashboard/portfolio-chart'
import { AIControlPanel } from '@/components/trading/ai-control-panel'
import { useTradingStore } from '@/lib/stores/trading-store'
import { Portfolio, Trade } from '@/lib/types'

export default function TradingDashboard() {
  const {
    portfolio,
    trades,
    currentSignal,
    isAutoTrading,
    setPortfolio,
    setTrades,
    setCurrentSignal,
    setAutoTrading
  } = useTradingStore()

  const [portfolioHistory, setPortfolioHistory] = useState<Array<{ time: Date; value: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tradingInterval, setTradingInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchPortfolioData()
    const interval = setInterval(fetchPortfolioData, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch('/api/portfolio')
      if (response.ok) {
        const data = await response.json()
        setPortfolio(data.portfolio)
        setTrades(data.recentTrades)

        setPortfolioHistory(prev => [
          ...prev.slice(-99),
          { time: new Date(), value: data.portfolio.totalValue }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeMarket = async () => {
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSignal(data.signal)

        if (isAutoTrading && data.signal.action !== 'hold' && data.riskMetrics.riskScore > 0.6) {
          await executeTrade(data.signal)
        }
      }
    } catch (error) {
      console.error('Market analysis failed:', error)
    }
  }

  const executeTrade = async (signal: any) => {
    try {
      const response = await fetch('/api/trading/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: signal.symbol,
          side: signal.action,
          quantity: signal.suggestedQuantity,
          useAI: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.trade) {
          await fetchPortfolioData()
        }
      }
    } catch (error) {
      console.error('Trade execution failed:', error)
    }
  }

  const handleStartTrading = () => {
    setAutoTrading(true)
    analyzeMarket()
    const interval = setInterval(analyzeMarket, 30000)
    setTradingInterval(interval)
  }

  const handleStopTrading = () => {
    setAutoTrading(false)
    if (tradingInterval) {
      clearInterval(tradingInterval)
      setTradingInterval(null)
    }
    setCurrentSignal(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading trading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vambe AI Trading</h1>
          <p className="text-gray-400">AI-powered cryptocurrency trading platform</p>
        </header>

        <div className="space-y-6">
          <PortfolioOverview portfolio={portfolio} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PortfolioChart data={portfolioHistory} />
            </div>
            <div>
              <AIControlPanel
                onStartTrading={handleStartTrading}
                onStopTrading={handleStopTrading}
                currentSignal={currentSignal}
              />
            </div>
          </div>

          <PositionsGrid positions={portfolio?.positions || []} />

          <TradesList trades={trades} />
        </div>
      </div>
    </div>
  )
}