
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WinLossPieChartProps {
  wins: number;
  losses: number;
}

const data = (wins: number, losses: number) => [
  { name: 'Wins', value: wins },
  { name: 'Losses', value: losses },
];

const COLORS = ['#10b981', '#ef4444'];

const WinLossPieChart: React.FC<WinLossPieChartProps> = ({ wins, losses }) => {
  const chartData = data(wins, losses);
  return (
    <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
        <PieChart>
            <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
            {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            </Pie>
             <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#111827' }}
            />
            <Legend wrapperStyle={{ color: '#6b7280' }}/>
        </PieChart>
        </ResponsiveContainer>
    </div>
  );
};

export default WinLossPieChart;