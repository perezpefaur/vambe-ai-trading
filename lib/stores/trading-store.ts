import { create } from 'zustand'
import { Trade, Position, Portfolio, MarketData, TradingSignal } from '@/lib/types'

interface TradingStore {
  portfolio: Portfolio | null
  trades: Trade[]
  marketData: MarketData[]
  currentSignal: TradingSignal | null
  isTrading: boolean
  isAutoTrading: boolean

  setPortfolio: (portfolio: Portfolio) => void
  addTrade: (trade: Trade) => void
  setTrades: (trades: Trade[]) => void
  setMarketData: (data: MarketData[]) => void
  setCurrentSignal: (signal: TradingSignal | null) => void
  setIsTrading: (status: boolean) => void
  setAutoTrading: (enabled: boolean) => void
  updatePosition: (position: Position) => void
}

export const useTradingStore = create<TradingStore>((set) => ({
  portfolio: null,
  trades: [],
  marketData: [],
  currentSignal: null,
  isTrading: false,
  isAutoTrading: false,

  setPortfolio: (portfolio) => set({ portfolio }),

  addTrade: (trade) => set((state) => ({
    trades: [trade, ...state.trades].slice(0, 100)
  })),

  setTrades: (trades) => set({ trades }),

  setMarketData: (marketData) => set({ marketData }),

  setCurrentSignal: (currentSignal) => set({ currentSignal }),

  setIsTrading: (isTrading) => set({ isTrading }),

  setAutoTrading: (isAutoTrading) => set({ isAutoTrading }),

  updatePosition: (position) => set((state) => {
    if (!state.portfolio) return state

    const positions = state.portfolio.positions.map(p =>
      p.symbol === position.symbol ? position : p
    )

    const totalPnl = positions.reduce((acc, pos) => acc + pos.pnl, 0)
    const totalValue = state.portfolio.cashBalance +
      positions.reduce((acc, pos) => acc + pos.notional, 0)

    return {
      portfolio: {
        ...state.portfolio,
        positions,
        totalValue,
        totalPnl,
        totalPnlPercent: (totalPnl / totalValue) * 100
      }
    }
  })
}))