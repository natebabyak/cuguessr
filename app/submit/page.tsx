"use client";

import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { HomeButton } from "@/components/submit/home-button";
import { Map, MapLayerMouseEvent } from "react-map-gl/maplibre";
import { MapMarker } from "@/components/submit/map-marker";
import { PhotoCard } from "@/components/submit/photo-card";
import { toast } from "sonner";
import { useState } from "react";
import { Coordinates } from "@/lib/types";
import { calculateDistance } from "@/lib/utils";
import { SubmitButtonGroup } from "@/components/submit/submit-button-group";

const MAP_STYLE_PREFIX = "https://api.maptiler.com/maps/";
const MAP_STYLE_SUFFIX = `-v4/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`;

export default function Page() {
  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [cursorCoordinates, setCursorCoordinates] =
    useState<Coordinates | null>(null);
  const [markerCoordinates, setMarkerCoordinates] =
    useState<Coordinates | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [mapStyle, setMapStyle] = useState<"hybrid" | "streets">("streets");

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
    <div className="relative h-dvh w-dvw">
      <Map
        cursor={cursor}
        initialViewState={{
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
          zoom: DEFAULT_ZOOM,
        }}
        mapStyle={`${MAP_STYLE_PREFIX}${mapStyle}${MAP_STYLE_SUFFIX}`}
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
        <div className="pointer-events-none absolute grid h-dvh w-dvw grid-cols-2 grid-rows-2 px-2 pt-2 pb-10 md:px-4 md:pt-4 md:pb-12">
          <PhotoCard setPhoto={setPhoto} />
          <HomeButton />
          <SubmitButtonGroup
            markerCoordinates={markerCoordinates}
            photo={photo}
            mapStyle={mapStyle}
            setMapStyle={setMapStyle}
          />
        </div>
      </Map>
    </div>
  );
}
