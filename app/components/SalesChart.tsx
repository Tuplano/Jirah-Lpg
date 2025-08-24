'use client';

import { Sale } from '@/lib/type';

interface SalesChartProps {
  sales: Sale[];
}

export default function SalesChart({ sales }: SalesChartProps) {
  const getTotalSales = () => {
    return sales.reduce((total, sale) => total + sale.quantity, 0);
  };

  const getTotalRevenue = () => {
    return sales.reduce((total, sale) => total + sale.amount, 0);
  };

  const getSalesBySize = () => {
    const salesBySize: Record<string, { quantity: number; amount: number }> = {};
    
    sales.forEach(sale => {
      if (!salesBySize[sale.tank_size]) {
        salesBySize[sale.tank_size] = { quantity: 0, amount: 0 };
      }
      salesBySize[sale.tank_size].quantity += sale.quantity;
      salesBySize[sale.tank_size].amount += sale.amount;
    });

    return salesBySize;
  };

  const salesBySize = getSalesBySize();
  const totalQuantity = getTotalSales();

  return (
  <div className="max-h-96 overflow-y-auto rounded-lg shadow p-5 bg-white">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{getTotalSales()}</div>
          <div className="text-sm text-green-600">Tanks Sold</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">₱{getTotalRevenue().toLocaleString()}</div>
          <div className="text-sm text-blue-600">Total Revenue</div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Sales by Tank Size</h3>
        {Object.entries(salesBySize).map(([size, data]) => {
          const percentage = totalQuantity > 0 ? (data.quantity / totalQuantity) * 100 : 0;
          return (
            <div key={size} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{size}</span>
                <span className="text-gray-600">{data.quantity} tanks (₱{data.amount.toLocaleString()})</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {sales.length === 0 && (
        <p className="text-gray-500 text-center py-4">No recent sales</p>
      )}
    </div>
  );
}