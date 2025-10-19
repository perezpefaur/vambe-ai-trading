'use client'

import { Portfolio } from '@/lib/types'
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'

interface PortfolioOverviewProps {
  portfolio: Portfolio | null
}

export function PortfolioOverview({ portfolio }: PortfolioOverviewProps) {
  if (!portfolio) {
    return (
      <div className="glass-card p-6">
        <p className="text-gray-500">Loading portfolio...</p>
      </div>
    )
  }

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Account Value</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(portfolio.totalValue)}
            </p>
          </div>
          <DollarSign className="text-gray-600" size={24} />
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Cash Balance</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(portfolio.cashBalance)}
            </p>
          </div>
          <Wallet className="text-gray-600" size={24} />
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total P&L</p>
            <p className={`text-2xl font-bold mt-1 ${portfolio.totalPnl >= 0 ? 'profit-text' : 'loss-text'}`}>
              {formatCurrency(portfolio.totalPnl)}
            </p>
          </div>
          {portfolio.totalPnl >= 0 ? (
            <TrendingUp className="text-green-400" size={24} />
          ) : (
            <TrendingDown className="text-red-400" size={24} />
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total P&L %</p>
            <p className={`text-2xl font-bold mt-1 ${portfolio.totalPnlPercent >= 0 ? 'profit-text' : 'loss-text'}`}>
              {formatPercent(portfolio.totalPnlPercent)}
            </p>
          </div>
          {portfolio.totalPnlPercent >= 0 ? (
            <TrendingUp className="text-green-400" size={24} />
          ) : (
            <TrendingDown className="text-red-400" size={24} />
          )}
        </div>
      </div>
    </div>
  )
}