'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface SymptomTrendPoint {
  date: string
  avgSeverity: number
  count: number
}

interface SymptomBreakdownPoint {
  name: string
  count: number
}

interface InsightChartsProps {
  symptomTrend: SymptomTrendPoint[]
  symptomBreakdown: SymptomBreakdownPoint[]
}

export default function InsightCharts({
  symptomTrend,
  symptomBreakdown,
}: InsightChartsProps) {
  return (
    <div className="space-y-5">
      {/* Symptom Severity Trend */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          Symptom Severity Over Time
        </h2>
        <p className="text-xs text-stone-400 mb-4">Average severity per day</p>
        {symptomTrend.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">
            No symptom data in this period
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart
              data={symptomTrend}
              margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
            >
              <defs>
                <linearGradient id="severityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 5, 10]}
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
                formatter={(value) => [Number(value ?? 0).toFixed(1), 'Avg severity']}
                labelStyle={{ color: '#78716c', marginBottom: 2 }}
              />
              <Area
                type="monotone"
                dataKey="avgSeverity"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#severityGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#059669', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Symptom Breakdown Bar Chart */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          Symptom Breakdown
        </h2>
        <p className="text-xs text-stone-400 mb-4">Most frequent symptom types</p>
        {symptomBreakdown.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">
            No symptom data in this period
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={symptomBreakdown}
              margin={{ top: 4, right: 4, left: -28, bottom: 24 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                axisLine={false}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                axisLine={false}
                tickLine={false}
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
                formatter={(value) => [Number(value ?? 0), 'occurrences']}
                labelStyle={{ color: '#78716c' }}
              />
              <Bar
                dataKey="count"
                fill="#d1fae5"
                stroke="#059669"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
