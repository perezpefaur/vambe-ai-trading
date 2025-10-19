'use client'

import { useState } from 'react'
import { Brain, Play, Pause, AlertCircle, Settings } from 'lucide-react'
import { TradingSignal } from '@/lib/types'
import { useTradingStore } from '@/lib/stores/trading-store'

interface AIControlPanelProps {
  onStartTrading: () => void
  onStopTrading: () => void
  currentSignal: TradingSignal | null
}

export function AIControlPanel({ onStartTrading, onStopTrading, currentSignal }: AIControlPanelProps) {
  const { isAutoTrading, setAutoTrading } = useTradingStore()
  const [maxRiskPercent, setMaxRiskPercent] = useState(5)
  const [tradingPairs, setTradingPairs] = useState(['BTC/USDT', 'ETH/USDT', 'SOL/USDT'])

  const handleToggleAutoTrading = () => {
    if (isAutoTrading) {
      onStopTrading()
      setAutoTrading(false)
    } else {
      onStartTrading()
      setAutoTrading(true)
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="text-blue-400" size={24} />
          <h2 className="text-xl font-semibold">AI Trading Control</h2>
        </div>
        <button
          onClick={handleToggleAutoTrading}
          className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            isAutoTrading
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
        >
          {isAutoTrading ? (
            <>
              <Pause size={16} />
              Stop Trading
            </>
          ) : (
            <>
              <Play size={16} />
              Start Trading
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Max Risk Per Trade</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="10"
              value={maxRiskPercent}
              onChange={(e) => setMaxRiskPercent(Number(e.target.value))}
              className="flex-1"
              disabled={isAutoTrading}
            />
            <span className="text-sm font-medium w-12">{maxRiskPercent}%</span>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Trading Pairs</label>
          <select
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm"
            disabled={isAutoTrading}
          >
            <option>All Major Pairs (3)</option>
            <option>BTC Only</option>
            <option>Custom Selection</option>
          </select>
        </div>
      </div>

      {currentSignal && (
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-yellow-400" size={16} />
            <span className="text-sm font-medium">Current Signal</span>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Symbol:</span>
              <span className="font-medium">{currentSignal.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Action:</span>
              <span className={`font-medium uppercase ${
                currentSignal.action === 'buy' ? 'text-green-400' :
                currentSignal.action === 'sell' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {currentSignal.action}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Confidence:</span>
              <span className="font-medium">{(currentSignal.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="pt-2 border-t border-gray-800">
              <p className="text-sm text-gray-400">{currentSignal.reasoning}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isAutoTrading ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
        <span className="text-sm text-gray-400">
          {isAutoTrading ? 'AI Trading Active' : 'AI Trading Inactive'}
        </span>
      </div>
    </div>
  )
}