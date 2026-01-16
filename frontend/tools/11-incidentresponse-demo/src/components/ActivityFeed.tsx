/**
 * Activity Feed Component
 * Shows real-time activity stream
 */

import { Clock } from 'lucide-react';
import { recentActivity } from '../api/demoData';

export function ActivityFeed() {
  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary-400" />
        Live Activity Feed
      </h3>
      <div className="space-y-3">
        {recentActivity.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
          >
            <span className="text-xl flex-shrink-0">{activity.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
