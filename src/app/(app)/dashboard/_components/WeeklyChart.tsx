'use client'

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface WeeklyChartProps {
  data: { date: string; count: number }[]
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={128}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="symptomGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#78716c' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e7e5e4',
            borderRadius: '8px',
            fontSize: 12,
            padding: '4px 10px',
          }}
          itemStyle={{ color: '#059669' }}
          formatter={(value) => [value ?? 0, 'Symptoms']}
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
