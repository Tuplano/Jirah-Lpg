"use client";

import { useState, useEffect } from "react";
import type {
  InventorySummary,
  InventoryMovement,
  Sale,
  TrackingLocation,
} from "@/lib/type";

// Components
import QuickActions from "./components/QuickActions";
import RecentActivity from "./components/RecentActivity";
import SalesChart from "./components/SalesChart";
import InventoryOverview from "./components/InventoryOverview";
import LiveTracking from "./components/LiveTracking";
import LocationSender from "./components/LocationSender";

export default function Dashboard() {
  const [mode, setMode] = useState<"live" | "record">("live");
  const [inventory, setInventory] = useState<InventorySummary[]>([]);
  const [recentMovements, setRecentMovements] = useState<InventoryMovement[]>([]);
  const [tracking, setTracking] = useState<TrackingLocation[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });
  const [recording, setRecording] = useState(false);

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
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-xs sm:text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
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
          className="border border-gray-300 rounded-md p-2 text-sm w-full sm:w-auto"
        />
      </div>

      {/* Inventory + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryOverview inventory={inventory} />
        </div>
        <div>
          <QuickActions onActionComplete={loadData} />
        </div>
      </div>

      {/* Recent Activity + Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity movements={recentMovements} selectedDate={selectedDate} />
        <SalesChart sales={recentSales} />
      </div>

      {/* Mode Switch + Recording */}
      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex bg-gray-200 rounded-lg overflow-hidden shadow w-full sm:w-auto">
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium transition ${
              mode === "live"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setMode("live")}
          >
            🚀 Live Mode
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium transition ${
              mode === "record"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setMode("record")}
          >
            📜 View Record
          </button>
        </div>

        <button
          className={`px-4 py-2 rounded-lg shadow font-medium transition w-full sm:w-auto ${
            recording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          } text-white`}
          onClick={() => setRecording(!recording)}
        >
          {recording ? "⏹ Stop Recording" : "🎥 Start Recording"}
        </button>
      </div>

      {recording && <LocationSender driverId="driver_123" />}

      {/* Live Tracking */}
      <div className="mt-4">
        <LiveTracking tracking={tracking} mode={mode} />
      </div>
    </div>
  );
}
