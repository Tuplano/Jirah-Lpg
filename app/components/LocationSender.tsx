"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function LocationSender({ driverId }: { driverId: string }) {
  const lastSent = useRef<number>(0);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();

        if (now - lastSent.current > 10000) {
          lastSent.current = now;

          const { latitude, longitude } = pos.coords;
          await supabase.from("locations").insert([
            {
              driver_id: driverId,
              latitude,
              longitude,
            },
          ]);
        }
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverId]);

  return null;
}
