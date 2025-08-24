"use client";

import { InventoryMovement } from "@/lib/type";

interface RecentActivityProps {
  movements: InventoryMovement[];
  selectedDate: string; // Must be passed from parent in "YYYY-MM-DD"
}

export default function RecentActivity({
  movements,
  selectedDate,
}: RecentActivityProps) {
  const getMovementIcon = (type: string) => {
    switch (type) {
      case "replenishment":
        return "↩️";
      case "delivery":
        return "🚚";
      case "sale":
        return "📦";
      case "add_stock":
        return "📥";
      default:
        return "📋";
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case "replenishment":
        return "text-blue-600 bg-blue-50";
      case "delivery":
        return "text-green-600 bg-green-50";
      case "return":
        return "text-yellow-600 bg-yellow-50";
      case "add_stock":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Filter movements for the selected date safely
  const filteredMovements = movements.filter((m) => {
    if (!m.date) return false;
    const movementDate = new Date(m.date).toISOString().slice(0, 10);
    return movementDate === selectedDate;
  });

const sortedMovements = filteredMovements.sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

  return (
  <div className="max-h-96 overflow-y-auto rounded-lg shadow p-5 bg-white">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Recent Activity
      </h2>

      {sortedMovements.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {sortedMovements.map((movement) => (
            <div
              key={movement.id}
              className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50"
            >
              <div
                className={`p-2 rounded-full ${getMovementColor(
                  movement.type
                )}`}
              >
                <span className="text-lg">
                  {getMovementIcon(movement.type)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 capitalize">
                  {movement.type} - {movement.tank_size}
                </div>
                <div className="text-sm text-gray-500">
                  Quantity: {movement.quantity} •{" "}
                  {new Date(movement.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {movement.customer_name && (
                  <div className="text-xs text-gray-400 truncate">
                    {movement.customer_name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
