'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface WeeklyChartProps {
  data: { date: string; count: number }[]
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="symptomGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#059669" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#a8a29e' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          domain={[0, maxCount]}
          tick={{ fontSize: 10, fill: '#a8a29e' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e7e5e4',
            borderRadius: '10px',
            fontSize: 12,
            padding: '6px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
          itemStyle={{ color: '#059669' }}
          formatter={(value) => [Number(value ?? 0), 'Symptoms']}
          labelStyle={{ color: '#78716c', marginBottom: 2 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#059669"
          strokeWidth={2}
          fill="url(#symptomGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#059669', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
