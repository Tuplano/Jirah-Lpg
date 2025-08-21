'use client';

import { InventoryMovement } from '@/lib/type';

interface RecentActivityProps {
  movements: InventoryMovement[];
}

export default function RecentActivity({ movements }: RecentActivityProps) {
  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'replenishment':
        return '📦';
      case 'delivery':
        return '🚚';
      case 'return':
        return '↩️';
      default:
        return '📋';
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'replenishment':
        return 'text-blue-600 bg-blue-50';
      case 'delivery':
        return 'text-green-600 bg-green-50';
      case 'return':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
      
      {movements.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {movements.map((movement) => (
            <div key={movement.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className={`p-2 rounded-full ${getMovementColor(movement.type)}`}>
                <span className="text-lg">{getMovementIcon(movement.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 capitalize">
                  {movement.type} - {movement.tank_size}
                </div>
                <div className="text-sm text-gray-500">
                  Quantity: {movement.quantity} • {new Date(movement.date).toLocaleDateString()}
                </div>
                {movement.customer_name && (
                  <div className="text-xs text-gray-400 truncate">{movement.customer_name}</div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}