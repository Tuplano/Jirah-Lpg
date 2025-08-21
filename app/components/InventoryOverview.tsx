"use client";

import { InventorySummary } from "@/lib/type";

interface InventoryOverviewProps {
  inventory: InventorySummary[];
}

export default function InventoryOverview({ inventory }: InventoryOverviewProps) {
  // ✅ Calculate totals
  const getTotalTanks = () =>
    inventory.reduce((acc, item) => acc + (item.total_tanks || 0), 0);

  const getTotalFull = () =>
    inventory.reduce((acc, item) => acc + (item.full_tanks || 0), 0);

  const getTotalForDelivery = () =>
    inventory.reduce((acc, item) => acc + (item.out_for_delivery || 0), 0);

  const getTotalEmpty = () =>
    inventory.reduce((acc, item) => acc + (item.empty_tanks || 0), 0);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Inventory Overview
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {getTotalTanks()}
          </div>
          <div className="text-sm text-blue-600">Total Tanks</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {getTotalFull()}
          </div>
          <div className="text-sm text-green-600">Full Tanks</div>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {getTotalForDelivery()}
          </div>
          <div className="text-sm text-yellow-600">Out for Delivery</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">
            {getTotalEmpty()}
          </div>
          <div className="text-sm text-gray-600">Empty Tanks</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tank Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Out for Delivery
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item, index) => {
              const fillPercentage =
                item.total_tanks > 0
                  ? (item.full_tanks / item.total_tanks) * 100
                  : 0;
              const isLowStock = fillPercentage < 20;

              return (
                <tr key={`${item.size}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {item.full_tanks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                    {item.out_for_delivery}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.empty_tanks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {item.total_tanks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            isLowStock ? "bg-red-500" : "bg-green-500"
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-xs ${
                          isLowStock ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {fillPercentage.toFixed(0)}%
                      </span>
                      {isLowStock && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
