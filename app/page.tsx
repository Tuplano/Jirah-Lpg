'use client';

import { useState, useEffect } from 'react';
import type { InventorySummary, InventoryMovement, Sale } from '@/lib/type';

// Components
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
import SalesChart from './components/SalesChart';
import InventoryOverview from './components/InventoryOverview';

export default function Dashboard() {
  const [inventory, setInventory] = useState<InventorySummary[]>([]);
  const [recentMovements, setRecentMovements] = useState<InventoryMovement[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Function to load data from your API
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');

      const data = await res.json();
      setInventory(data.inventory || []);
      setRecentMovements(data.movements || []);
      setRecentSales(data.sales || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch once on mount
  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryOverview inventory={inventory} />
        </div>
        <div>
          {/* pass loadData so QuickActions can refresh */}
          <QuickActions onActionComplete={loadData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity movements={recentMovements} />
        <SalesChart sales={recentSales} />
      </div>
    </div>
  );
}
