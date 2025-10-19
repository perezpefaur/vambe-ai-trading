'use client'

import { Position } from '@/lib/types'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PositionsGridProps {
  positions: Position[]
}

export function PositionsGrid({ positions }: PositionsGridProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  return (
    <div className="glass-card">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-semibold">Current Positions</h2>
        <p className="text-gray-400 text-sm mt-1">{positions.length} active positions</p>
      </div>

      {positions.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No open positions
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {positions.map((position) => (
            <div key={position.symbol} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{position.symbol}</h3>
                {position.pnl >= 0 ? (
                  <TrendingUp className="text-green-400" size={20} />
                ) : (
                  <TrendingDown className="text-red-400" size={20} />
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity:</span>
                  <span className="font-medium">{position.quantity.toFixed(4)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Price:</span>
                  <span>{formatCurrency(position.averagePrice)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Current:</span>
                  <span>{formatCurrency(position.currentPrice)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Notional:</span>
                  <span>{formatCurrency(position.notional)}</span>
                </div>

                <div className="pt-2 border-t border-gray-800">
                  <div className="flex justify-between">
                    <span className="text-gray-400">P&L:</span>
                    <span className={position.pnl >= 0 ? 'profit-text font-semibold' : 'loss-text font-semibold'}>
                      {formatCurrency(position.pnl)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-400">P&L %:</span>
                    <span className={position.pnlPercent >= 0 ? 'profit-text font-semibold' : 'loss-text font-semibold'}>
                      {formatPercent(position.pnlPercent)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}