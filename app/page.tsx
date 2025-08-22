"use client";

import { useState, useEffect } from "react";
import type { InventorySummary, InventoryMovement, Sale, TrackingLocation } from "@/lib/type";

// Components
import QuickActions from "./components/QuickActions";
import RecentActivity from "./components/RecentActivity";
import SalesChart from "./components/SalesChart";
import InventoryOverview from "./components/InventoryOverview";
import LiveTracking from "./components/LiveTracking";

export default function Dashboard() {
  const [inventory, setInventory] = useState<InventorySummary[]>([]);
  const [recentMovements, setRecentMovements] = useState<InventoryMovement[]>(
    []
  );
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
    const [tracking, setTracking] = useState<TrackingLocation[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });

  const loadData = async (date: string = selectedDate) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard?date=${date}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard data");

      const data = await res.json();
      setInventory(data.inventory || []);
      setRecentMovements(data.movements || []);
      setRecentSales(data.sales || []);
      setTracking(data.tracking || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

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
      <div className="flex items-center space-x-4 mb-4">
        <label
          htmlFor="inventory-date"
          className="text-sm font-medium text-gray-700"
        >
          Select Date:
        </label>
        <input
          type="date"
          id="inventory-date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm"
        />
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
        <RecentActivity
          movements={recentMovements}
          selectedDate={selectedDate}
        />
        <SalesChart sales={recentSales} />
      </div>
    <LiveTracking tracking={tracking} />

    </div>
  );
}
