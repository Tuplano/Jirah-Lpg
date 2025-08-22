"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { TrackingLocation } from "@/lib/type";
import { Flame } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { useEffect, useState } from "react";
import type { DivIcon } from "leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false }
);

type LiveTrackingProps = {
  tracking: TrackingLocation[];
};

export default function LiveTracking({ tracking }: LiveTrackingProps) {
  const [carIcon, setCarIcon] = useState<DivIcon | null>(null); 

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof window !== "undefined") {
        const leaflet = (await import("leaflet")).default;
        const icon = new leaflet.DivIcon({
          html: renderToStaticMarkup(<Flame size={28} color="red" />),
          className: "lucide-marker",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        if (mounted) setCarIcon(icon);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!tracking || tracking.length === 0) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-2">🚗 Live Driver Tracking</h2>
        <p>No drivers yet…</p>
      </div>
    );
  }

  const latest = tracking[tracking.length - 1];
  const path = tracking.map((loc) => [loc.latitude, loc.longitude]) as [
    number,
    number
  ][];

  return (
    <div className="p-4 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-2">🚗 Live Driver Tracking</h2>
      <MapContainer
        center={[latest.latitude, latest.longitude]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {carIcon &&
          tracking.map((loc, idx) => (
            <Marker
              key={`${loc.driver_id ?? "unknown"}-${loc.date}-${idx}`}
              position={[loc.latitude, loc.longitude]}
              icon={carIcon}
            >
              <Popup>
                <p>
                  <strong>Driver:</strong> {loc.driver_id ?? "Unknown"}
                </p>
                <p>
                  <strong>Time:</strong> {new Date(loc.date).toLocaleString()}
                </p>
                <p>
                  <strong>Lat:</strong> {loc.latitude}
                </p>
                <p>
                  <strong>Lng:</strong> {loc.longitude}
                </p>
              </Popup>
            </Marker>
          ))}

        <Polyline positions={path} color="blue" />
      </MapContainer>
    </div>
  );
}
