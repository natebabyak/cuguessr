"use client";

import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { HomeButton } from "./home-button";
import { Map, MapLayerMouseEvent } from "react-map-gl/maplibre";
import { MapButtonGroup } from "./map-button-group";
import { MapMarker } from "./map-marker";
import { PhotoCard } from "./photo-card";
import { toast } from "sonner";
import { useState } from "react";
import { Coordinates } from "@/lib/types";
import { calculateDistance } from "@/lib/utils";

export default function Page() {
  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [cursorCoordinates, setCursorCoordinates] =
    useState<Coordinates | null>(null);
  const [markerCoordinates, setMarkerCoordinates] =
    useState<Coordinates | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  const setMarkerCoordinatesWrapper = (coordinates: Coordinates) => {
    const MAX_DISTANCE = 2_000;

    const { latitude, longitude } = coordinates;

    if (
      calculateDistance(
        { latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE },
        { latitude, longitude },
      ) > MAX_DISTANCE
    ) {
      toast.error("Marker Too Far from Campus");
      return;
    }

    setMarkerCoordinates(coordinates);
  };

  const handleClick = (event: MapLayerMouseEvent) => {
    const { lat, lng } = event.lngLat;
    setMarkerCoordinatesWrapper({ latitude: lat, longitude: lng });
  };

  const handleMouseDown = () => {
    setCursor("grabbing");
  };

  const handleMouseMove = (event: MapLayerMouseEvent) => {
    const { lat, lng } = event.lngLat;
    setCursorCoordinates({ latitude: lat, longitude: lng });
  };

  const handleMouseUp = () => {
    setCursor("crosshair");
  };

  return (
    <main className="h-screen w-screen">
      <Map
        cursor={cursor}
        initialViewState={{
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
          zoom: DEFAULT_ZOOM,
        }}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <MapMarker
          cursorCoordinates={cursorCoordinates}
          markerCoordinates={markerCoordinates}
          setMarkerCoordinates={setMarkerCoordinatesWrapper}
        />
        <PhotoCard setPhoto={setPhoto} />
        <HomeButton />
        <MapButtonGroup markerCoordinates={markerCoordinates} photo={photo} />
      </Map>
    </main>
  );
}
