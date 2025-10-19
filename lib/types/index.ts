export interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  price: number
  quantity: number
  notional: number
  fee?: number
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
  pnl?: number
  aiReasoning?: string
}

export interface Position {
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice: number
  notional: number
  pnl: number
  pnlPercent: number
  lastUpdated: Date
}

export interface Portfolio {
  totalValue: number
  cashBalance: number
  positions: Position[]
  totalPnl: number
  totalPnlPercent: number
}

export interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
}

export interface TradingSignal {
  symbol: string
  action: 'buy' | 'sell' | 'hold'
  confidence: number
  reasoning: string
  suggestedQuantity?: number
  targetPrice?: number
  stopLoss?: number
}