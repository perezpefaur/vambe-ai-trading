'use client'

import { Trade } from '@/lib/types'
import { format } from 'date-fns'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface TradesListProps {
  trades: Trade[]
}

export function TradesList({ trades }: TradesListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <div className="glass-card">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-semibold">Completed Trades</h2>
        <p className="text-gray-400 text-sm mt-1">Showing last 5 trades</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Side
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Notional
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                P&L
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {trades.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No trades yet
                </td>
              </tr>
            ) : (
              trades.slice(0, 5).map((trade) => (
                <tr key={trade.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {format(trade.timestamp, 'HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{trade.symbol}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {trade.side === 'buy' ? (
                        <>
                          <ArrowUpRight className="text-green-400" size={16} />
                          <span className="text-green-400 font-medium">BUY</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="text-red-400" size={16} />
                          <span className="text-red-400 font-medium">SELL</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatCurrency(trade.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {trade.quantity.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatCurrency(trade.notional)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {trade.pnl !== undefined ? (
                      <span className={trade.pnl >= 0 ? 'profit-text' : 'loss-text'}>
                        {formatCurrency(trade.pnl)}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}