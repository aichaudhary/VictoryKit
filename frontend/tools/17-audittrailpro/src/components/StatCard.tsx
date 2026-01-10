import React from 'react';

interface StatCardProps {
  name: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'red' | 'green' | 'yellow';
  change: string;
  changeType: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ name, value, icon: Icon, color, change, changeType }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  const changeClasses = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{name}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <span className={`font-medium ${changeClasses[changeType]}`}>
            {change}
          </span>
          <span className="text-gray-500"> from last month</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;