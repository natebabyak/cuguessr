"use client";

import { NavigationIcon } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";

export function RecenterButton() {
  const map = useMap();

  function recenter() {
    map.current?.flyTo({
      bearing: 0,
      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      zoom: DEFAULT_ZOOM,
    });
  }

  return (
    <Button onClick={recenter} size="icon-lg" title="Recenter" type="button">
      <NavigationIcon />
    </Button>
  );
}
