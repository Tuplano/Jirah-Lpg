"use client";

import { useState } from "react";

interface QuickActionsProps {
  onActionComplete: () => void;
}

export default function QuickActions({ onActionComplete }: QuickActionsProps) {
  const [showReplenishForm, setShowReplenishForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);

  const tankSizes = ["11kg", "2.7kg"];

  // ---------------- HANDLERS ----------------
const handleAddStock = async (date: string, tank_size: string, quantity: number) => {
  try {
    const res = await fetch("/api/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, type: "add_stock", tank_size, quantity }),
    });

    if (!res.ok) throw new Error("Failed to add stock");
    setShowReplenishForm(false);
    onActionComplete();
  } catch (err) {
    console.error(err);
    alert(err instanceof Error ? err.message : "Unexpected error");
  }
};

const handleReplenish = async (date: string, tank_size: string, quantity: number) => {
  try {
    const res = await fetch("/api/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, type: "replenishment", tank_size, quantity }),
    });

    if (!res.ok) throw new Error("Failed to record replenishment");
    setShowReplenishForm(false);
    onActionComplete();
  } catch (err) {
    console.error(err);
    alert(err instanceof Error ? err.message : "Unexpected error");
  }
};

  const handleDelivery = async (
    date: string,
    tank_size: string,
    quantity: number,
    customer_name?: string
  ) => {
    try {
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          type: "delivery",
          tank_size,
          quantity,
          customer_name,
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

  const handleSale = async (
    date: string,
    customer_name: string,
    tank_size: string,
    quantity: number,
    amount: number
  ) => {
    try {
      // Record sale
      const resSale = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          customer_name,
          tank_size,
          quantity,
          amount,
        }),
      });

      if (!resSale.ok) throw new Error("Failed to record sale");

      // Also record inventory movement
      await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          type: "sale",
          tank_size,
          quantity,
          customer_name,
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
          onClick={() => setShowReplenishForm(true)}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Stock (Replenishment)
        </button>

        <button
          onClick={() => setShowDeliveryForm(true)}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Record Delivery
        </button>

        <button
          onClick={() => setShowSaleForm(true)}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          Record Sale
        </button>
      </div>

      {/* Replenishment Modal */}
      {/* Replenishment / Add Stock Modal */}
      {showReplenishForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              Add Stock / Replenish Tanks
            </h3>
            <div className="space-y-4">
              <input
                type="date"
                id="replenish-date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full border rounded px-3 py-2"
              />
              <select
                id="replenish-size"
                className="w-full border rounded px-3 py-2"
              >
                {tankSizes.map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
              <input
                type="number"
                id="replenish-qty"
                min="1"
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
                onClick={() =>
                  handleReplenish(
                    (
                      document.getElementById(
                        "replenish-date"
                      ) as HTMLInputElement
                    ).value,
                    (
                      document.getElementById(
                        "replenish-size"
                      ) as HTMLSelectElement
                    ).value,
                    parseInt(
                      (
                        document.getElementById(
                          "replenish-qty"
                        ) as HTMLInputElement
                      ).value
                    )
                  )
                }
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Replenish
              </button>
              <button
                onClick={() =>
                  handleAddStock(
                    (
                      document.getElementById(
                        "replenish-date"
                      ) as HTMLInputElement
                    ).value,
                    (
                      document.getElementById(
                        "replenish-size"
                      ) as HTMLSelectElement
                    ).value,
                    parseInt(
                      (
                        document.getElementById(
                          "replenish-qty"
                        ) as HTMLInputElement
                      ).value
                    )
                  )
                }
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
                type="date"
                id="delivery-date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full border rounded px-3 py-2"
              />
              <select
                id="delivery-size"
                className="w-full border rounded px-3 py-2"
              >
                {tankSizes.map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
              <input
                type="number"
                id="delivery-qty"
                min="1"
                placeholder="Quantity"
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                id="delivery-customer"
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
                onClick={() =>
                  handleDelivery(
                    (
                      document.getElementById(
                        "delivery-date"
                      ) as HTMLInputElement
                    ).value,
                    (
                      document.getElementById(
                        "delivery-size"
                      ) as HTMLSelectElement
                    ).value,
                    parseInt(
                      (
                        document.getElementById(
                          "delivery-qty"
                        ) as HTMLInputElement
                      ).value
                    ),
                    (
                      document.getElementById(
                        "delivery-customer"
                      ) as HTMLInputElement
                    ).value
                  )
                }
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
                type="date"
                id="sale-date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                id="sale-customer"
                placeholder="Customer name"
                className="w-full border rounded px-3 py-2"
              />
              <select
                id="sale-size"
                className="w-full border rounded px-3 py-2"
              >
                {tankSizes.map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
              <input
                type="number"
                id="sale-qty"
                min="1"
                placeholder="Quantity"
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="number"
                id="sale-amount"
                step="0.01"
                min="0"
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
                onClick={() =>
                  handleSale(
                    (document.getElementById("sale-date") as HTMLInputElement)
                      .value,
                    (
                      document.getElementById(
                        "sale-customer"
                      ) as HTMLInputElement
                    ).value,
                    (document.getElementById("sale-size") as HTMLSelectElement)
                      .value,
                    parseInt(
                      (document.getElementById("sale-qty") as HTMLInputElement)
                        .value
                    ),
                    parseFloat(
                      (
                        document.getElementById(
                          "sale-amount"
                        ) as HTMLInputElement
                      ).value
                    )
                  )
                }
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
