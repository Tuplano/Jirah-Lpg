"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { LatLngTuple } from "leaflet";
import { useMap } from "react-leaflet";

// Dynamic imports
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

export interface TrackingLocation {
  latitude: number;
  longitude: number;
  date: string;
  driver_id: string;
}

interface Props {
  tracking: TrackingLocation[];
  mode: "live" | "record";
}

function Recenter({ center }: { center: LatLngTuple }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 15); // smooth recenter
    }
  }, [center, map]);

  return null;
}

export default function LiveTracking({ tracking, mode }: Props) {
  const [path, setPath] = useState<LatLngTuple[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [follow, setFollow] = useState(true);
  const [mapCenter, setMapCenter] = useState<LatLngTuple | null>(null);
  const initialCenter = useRef<LatLngTuple | null>(null);

  // Handle switching mode
  useEffect(() => {
    if (mode === "live") {
      setPath([]);
      initialCenter.current = null;
    } else if (mode === "record") {
      const dbPoints = tracking.map(
        (t) => [t.latitude, t.longitude] as LatLngTuple
      );
      setPath(dbPoints);
      if (dbPoints.length > 0) {
        initialCenter.current = dbPoints[0];
        setMapCenter(dbPoints[0]); // recenter to start of record
      }
    }
  }, [mode, tracking]);

  // Live tracking watcher
  useEffect(() => {
    if (mode !== "live") return;

    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPoint: LatLngTuple = [latitude, longitude];

        setPath((prev) => {
          const newPath = [...prev, newPoint];
          return newPath.slice(-500);
        });

        if (!initialCenter.current) {
          initialCenter.current = newPoint;
        }

        if (follow) {
          setMapCenter(newPoint); // recenter on latest position
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
  }, [mode, follow]);

  if (error) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-2">🚗 Driver Tracking</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (path.length === 0) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-2">🚗 Driver Tracking</h2>
        <p>
          {mode === "live"
            ? "Waiting for GPS signal…"
            : "No records found for this day."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          🚗 {mode === "live" ? "Live Driver Tracking" : "Recorded Route"}
        </h2>
        <button
          onClick={() => setFollow((f) => !f)}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm shadow"
        >
          {follow ? "🔓 Unlock map" : "📍 Follow driver"}
        </button>
      </div>

      <MapContainer
        center={mapCenter || path[0]} // initial load
        zoom={15}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Polyline positions={path} color={mode === "live" ? "blue" : "green"} />
        {mapCenter && <Recenter center={mapCenter} />}
      </MapContainer>
    </div>
  );
}
