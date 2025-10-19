'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface PortfolioChartProps {
  data: Array<{
    time: Date
    value: number
  }>
}

export function PortfolioChart({ data }: PortfolioChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const chartData = data.map(point => ({
    ...point,
    formattedTime: format(point.time, 'HH:mm')
  }))

  const isProfit = data.length > 1 && data[data.length - 1].value > data[0].value

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-4">Portfolio Performance</h2>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="formattedTime"
              stroke="#666"
              tick={{ fill: '#666' }}
            />
            <YAxis
              stroke="#666"
              tick={{ fill: '#666' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#999' }}
              itemStyle={{ color: isProfit ? '#00ff41' : '#ff3838' }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={isProfit ? '#00ff41' : '#ff3838'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: isProfit ? '#00ff41' : '#ff3838' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}