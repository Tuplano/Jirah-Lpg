"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { LatLngTuple } from "leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false }
);

export default function LiveTracking() {
  const [path, setPath] = useState<LatLngTuple[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [follow, setFollow] = useState(true); // toggle follow mode
  const initialCenter = useRef<LatLngTuple | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        setPath((prev) => {
          const newPoint: LatLngTuple = [latitude, longitude]; // ✅ enforce tuple
          const newPath = [...prev, newPoint];
          return newPath.slice(-500); // keep only last 500
        });

        // Save initial center only once
        if (!initialCenter.current) {
          initialCenter.current = [latitude, longitude];
        }
      },
      (err) => {
        if (err.code === 1) setError("Permission denied. Please allow location.");
        else if (err.code === 2) setError("Position unavailable.");
        else if (err.code === 3) setError("Request timed out.");
        else setError("Unknown error.");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-2">🚗 Live Driver Tracking</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (path.length === 0) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-2">🚗 Live Driver Tracking</h2>
        <p>Waiting for GPS signal…</p>
      </div>
    );
  }

  const latest = path[path.length - 1];
  const mapCenter = follow ? latest : initialCenter.current || latest;

  return (
    <div className="p-4 bg-white rounded-2xl shadow space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🚗 Live Driver Tracking</h2>
        <button
          onClick={() => setFollow((f) => !f)}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm shadow"
        >
          {follow ? "🔓 Unlock map" : "📍 Follow driver"}
        </button>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Polyline positions={path} color="blue" />
      </MapContainer>
    </div>
  );
}
