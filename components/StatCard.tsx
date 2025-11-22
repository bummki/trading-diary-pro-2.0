
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  isPositive?: boolean;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, isPositive, icon }) => {
  const valueColor = isPositive === undefined ? 'text-text-primary' : isPositive ? 'text-success' : 'text-danger';

  return (
    <div className="bg-secondary p-5 rounded-lg shadow-lg flex items-center space-x-4">
        <div className="bg-accent p-3 rounded-full">
            {icon}
        </div>
      <div>
        <p className="text-sm text-text-secondary font-medium">{title}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
