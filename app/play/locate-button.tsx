"use client";

import { Button } from "@/components/ui/button";
import { Locate } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";

const ZOOM = 20;

export function LocateButton() {
  const { current: map } = useMap();

  const handleClick = () => {
    if (!map) return;

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      map.flyTo({
        center: [longitude, latitude],
        zoom: ZOOM,
      });
    });
  };

  return (
    <Button onClick={handleClick} size="icon" className="rounded-full">
      <Locate />
    </Button>
  );
}
