"use client";

import { useState } from "react";

interface QuickActionsProps {
  onActionComplete: () => void;
}

interface StockData {
  date: string;
  type: string;
  tank_size: string;
  quantity: string;
}

interface DeliveryData {
  date: string;
  tank_size: string;
  quantity: string;
  customer_name?: string;
}

interface SaleData {
  date: string;
  customer_name: string;
  tank_size: string;
  quantity: string;
  amount: string;
}

export default function QuickActions({ onActionComplete }: QuickActionsProps) {
  const [showReplenishForm, setShowReplenishForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);

  const [stock, setStockData] = useState<StockData>({
    date: "",
    type: "",
    tank_size: "",
    quantity: "",
  });

  const [delivery, setDeliveryData] = useState<DeliveryData>({
    date: "",
    tank_size: "",
    quantity: "",
    customer_name: "",
  });

  const [sale, setSalesData] = useState<SaleData>({
    date: "",
    customer_name: "",
    tank_size: "",
    quantity: "",
    amount: "",
  });

  const tankSizes = ["11kg", "2.7kg"];

  const getLocalDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // ---------------- SHARED HANDLERS ----------------
  const handleStockChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStockData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDeliveryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSalesData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- API CALLS ----------------
  const handleAddStock = async () => {
    try {
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: stock.date,
          type: "add_stock",
          tank_size: stock.tank_size,
          quantity: parseInt(stock.quantity),
        }),
      });
      if (!res.ok) throw new Error("Failed to add stock");
      setShowReplenishForm(false);
      onActionComplete();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  const handleReplenish = async () => {
    try {
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: stock.date,
          type: "replenishment",
          tank_size: stock.tank_size,
          quantity: parseInt(stock.quantity),
        }),
      });
      if (!res.ok) throw new Error("Failed to record replenishment");
      setShowReplenishForm(false);
      onActionComplete();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  const handleDelivery = async () => {
    try {
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: delivery.date,
          type: "delivery",
          tank_size: delivery.tank_size,
          quantity: parseInt(delivery.quantity),
          customer_name: delivery.customer_name,
        }),
      });
      if (!res.ok) throw new Error("Failed to record delivery");
      setShowDeliveryForm(false);
      onActionComplete();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  const handleSale = async () => {
    try {
      // Record sale
      const resSale = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: sale.date,
          customer_name: sale.customer_name,
          tank_size: sale.tank_size,
          quantity: parseInt(sale.quantity),
          amount: parseFloat(sale.amount),
        }),
      });
      if (!resSale.ok) throw new Error("Failed to record sale");

      // Also record inventory movement
      await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: sale.date,
          type: "sale",
          tank_size: sale.tank_size,
          quantity: parseInt(sale.quantity),
          customer_name: sale.customer_name,
        }),
      });

      setShowSaleForm(false);
      onActionComplete();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  // ---------------- RENDER ----------------
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>

      <div className="space-y-3">
        <button
          onClick={() => {
            setStockData({ date: getLocalDateTime(), type: "", tank_size: "", quantity: "" });
            setShowReplenishForm(true);
          }}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Stock (Replenishment)
        </button>

        <button
          onClick={() => {
            setDeliveryData({ date: getLocalDateTime(), tank_size: "", quantity: "", customer_name: "" });
            setShowDeliveryForm(true);
          }}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Record Delivery
        </button>

        <button
          onClick={() => {
            setSalesData({ date: getLocalDateTime(), customer_name: "", tank_size: "", quantity: "", amount: "" });
            setShowSaleForm(true);
          }}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          Record Sale
        </button>
      </div>

      {/* Replenishment / Add Stock Modal */}
      {showReplenishForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add Stock / Replenish Tanks</h3>
            <div className="space-y-4">
              <input
                type="datetime-local"
                name="date"
                value={stock.date}
                onChange={handleStockChange}
                className="w-full border rounded px-3 py-2"
              />
              <select
                name="tank_size"
                value={stock.tank_size}
                onChange={handleStockChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select size</option>
                {tankSizes.map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
              <input
                type="number"
                name="quantity"
                min="1"
                value={stock.quantity}
                onChange={handleStockChange}
                placeholder="Quantity"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowReplenishForm(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleReplenish}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Replenish
              </button>
              <button
                onClick={handleAddStock}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Modal */}
      {showDeliveryForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Record Delivery</h3>
            <div className="space-y-4">
              <input
                type="datetime-local"
                name="date"
                value={delivery.date}
                onChange={handleDeliveryChange}
                className="w-full border rounded px-3 py-2"
              />
              <select
                name="tank_size"
                value={delivery.tank_size}
                onChange={handleDeliveryChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select size</option>
                {tankSizes.map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
              <input
                type="number"
                name="quantity"
                min="1"
                value={delivery.quantity}
                onChange={handleDeliveryChange}
                placeholder="Quantity"
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="customer_name"
                value={delivery.customer_name}
                onChange={handleDeliveryChange}
                placeholder="Customer name (optional)"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeliveryForm(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDelivery}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                Record Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Modal */}
      {showSaleForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Record Sale</h3>
            <div className="space-y-4">
              <input
                type="datetime-local"
                name="date"
                value={sale.date}
                onChange={handleSaleChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="customer_name"
                value={sale.customer_name}
                onChange={handleSaleChange}
                placeholder="Customer name"
                className="w-full border rounded px-3 py-2"
              />
              <select
                name="tank_size"
                value={sale.tank_size}
                onChange={handleSaleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select size</option>
                {tankSizes.map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
              <input
                type="number"
                name="quantity"
                min="1"
                value={sale.quantity}
                onChange={handleSaleChange}
                placeholder="Quantity"
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0"
                value={sale.amount}
                onChange={handleSaleChange}
                placeholder="Amount ₱"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSaleForm(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSale}
                className="px-4 py-2 bg-purple-600 text-white rounded-md"
              >
                Record Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
