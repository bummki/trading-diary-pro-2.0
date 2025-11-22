
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trade } from '../types';

interface PerformanceChartProps {
  trades: Trade[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ trades }) => {
  const data = trades
    .slice() // Create a shallow copy to avoid mutating the original array
    .reverse() // trades are sorted descending, so reverse for chronological chart
    .reduce((acc, trade, index) => {
      const cumulativePnl = (acc[index - 1]?.cumulativePnl || 0) + trade.pnl;
      acc.push({
        name: `Trade ${index + 1}`,
        pnl: trade.pnl,
        cumulativePnl: cumulativePnl,
        date: new Date(trade.date).toLocaleDateString(),
      });
      return acc;
    }, [] as { name: string; pnl: number; cumulativePnl: number; date: string }[]);

  return (
    <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#111827' }}
                itemStyle={{ color: '#3b82f6' }}
            />
            <Legend wrapperStyle={{ color: '#6b7280' }}/>
            <Line type="monotone" dataKey="cumulativePnl" name="Cumulative P/L" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
        </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;