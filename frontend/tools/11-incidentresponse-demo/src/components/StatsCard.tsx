/**
 * Stats Card Component
 * Displays key metrics with visual styling
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'rose' | 'orange' | 'yellow' | 'blue' | 'green' | 'purple';
}

const colorMap = {
  rose: 'border-rose-500/30 hover:border-rose-500/50',
  orange: 'border-orange-500/30 hover:border-orange-500/50',
  yellow: 'border-yellow-500/30 hover:border-yellow-500/50',
  blue: 'border-blue-500/30 hover:border-blue-500/50',
  green: 'border-green-500/30 hover:border-green-500/50',
  purple: 'border-purple-500/30 hover:border-purple-500/50',
};

const iconBgMap = {
  rose: 'bg-rose-500/20 text-rose-400',
  orange: 'bg-orange-500/20 text-orange-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  blue: 'bg-blue-500/20 text-blue-400',
  green: 'bg-green-500/20 text-green-400',
  purple: 'bg-purple-500/20 text-purple-400',
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'rose',
}: StatsCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-green-400' : 'text-gray-400';

  return (
    <div className={`glass-card rounded-xl p-5 border ${colorMap[color]} transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${iconBgMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trendColor} text-sm`}>
            <TrendIcon className="w-4 h-4" />
            {trendValue && <span className="font-medium">{trendValue}</span>}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-400 text-sm">{title}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}
