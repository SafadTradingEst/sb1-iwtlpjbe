import React from 'react';

interface StatisticCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center transition-transform hover:transform hover:scale-105">
      <div className={`p-3 rounded-full ${color} mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatisticCard;