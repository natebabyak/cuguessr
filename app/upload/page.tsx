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
import { useState } from "react";

export default function Page() {
  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [cursorLatitude, setCursorLatitude] = useState<number>(0);
  const [cursorLongitude, setCursorLongitude] = useState<number>(0);
  const [markerLatitude, setMarkerLatitude] = useState<number | null>(null);
  const [markerLongitude, setMarkerLongitude] = useState<number | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  const handleClick = (event: MapLayerMouseEvent) => {
    const { lat, lng } = event.lngLat;
    setMarkerLatitude(lat);
    setMarkerLongitude(lng);
  };

  const handleMouseDown = () => {
    setCursor("grabbing");
  };

  const handleMouseMove = (event: MapLayerMouseEvent) => {
    const { lat, lng } = event.lngLat;
    setCursorLatitude(lat);
    setCursorLongitude(lng);
  };

  const handleMouseUp = () => {
    setCursor("crosshair");
  };

  return (
    <main className="w-screen h-screen">
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
          cursorLatitude={cursorLatitude}
          cursorLongitude={cursorLongitude}
          markerLatitude={markerLatitude}
          markerLongitude={markerLongitude}
          setMarkerLatitude={setMarkerLatitude}
          setMarkerLongitude={setMarkerLongitude}
        />
        <PhotoCard setPhoto={setPhoto} />
        <HomeButton />
        <MapButtonGroup
          markerLatitude={markerLatitude}
          markerLongitude={markerLongitude}
          photo={photo}
          setMarkerLatitude={setMarkerLatitude}
          setMarkerLongitude={setMarkerLongitude}
        />
      </Map>
    </main>
  );
}
