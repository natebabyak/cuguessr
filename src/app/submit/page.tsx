"use client";

import { Form } from "@formisch/react";
import {
  CompassIcon,
  Layers2Icon,
  LogOutIcon,
  MapPinIcon,
  NavigationIcon,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  type MapLayerMouseEvent,
  Map as MapLibreMap,
  type MapRef,
  Marker,
} from "react-map-gl/maplibre";
import * as v from "valibot";
import { SubmitDialog } from "@/components/submit-dialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Item } from "@/components/ui/item";
import { toast } from "@/components/ui/toast";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const schema = v.object({
  photo: v.file(),
  coordinates: v.object({
    latitude: v.number(),
    longitude: v.number(),
  }),
});

const ZOOM = 20;

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
      toast.add({ title: "Marker Too Far from Campus" });
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

  const mapRef = useRef<MapRef>(null);

  return (
    <MapLibreMap
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
      ref={mapRef}
    >
      <Marker
        anchor="bottom"
        draggable={true}
        latitude={markerCoordinates.latitude}
        longitude={markerCoordinates.longitude}
        onDrag={() => {
          if (!cursorCoordinates) return;
          setMarkerCoordinates(cursorCoordinates);
        }}
      >
        <MapPinIcon fill="#fff" className="size-8 text-primary" />
      </Marker>
      <div className="pointer-events-none absolute grid h-dvh w-dvw grid-cols-2 grid-rows-2 px-2 pt-2 pb-10 md:px-4 md:pt-4 md:pb-12">
        <Item className="pointer-events-auto col-span-2 h-fit justify-start justify-self-start"></Item>
        <Button
          size="icon-lg"
          className="pointer-events-auto self-end justify-self-start rounded-full hover:scale-105"
        >
          <Link href="/">
            <LogOutIcon className="rotate-180" />
          </Link>
        </Button>
        <ButtonGroup
          orientation="vertical"
          className="pointer-events-auto self-end justify-self-end"
        >
          <ButtonGroup className="ml-auto">
            <Button
              onClick={() => {
                if (mapStyle === "hybrid") {
                  setMapStyle("streets");
                } else {
                  setMapStyle("hybrid");
                }
              }}
              size="icon-lg"
              className="rounded-full"
            >
              <Layers2Icon
                className={cn(
                  mapStyle === "hybrid" &&
                    "[&>path:first-child]:fill-primary-foreground",
                )}
              />
            </Button>
          </ButtonGroup>
          <ButtonGroup orientation="vertical" className="ml-auto">
            <Button
              onClick={() => {
                const map = mapRef.current;
                if (!map) return;

                map.flyTo({
                  bearing: 0,
                  center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
                  zoom: DEFAULT_ZOOM,
                });
              }}
              size="icon-lg"
              className="rounded-full"
            >
              <CompassIcon />
            </Button>
            <Button
              disabled={!markerCoordinates}
              onClick={() => {
                const map = mapRef.current;
                if (!map || !markerCoordinates) return;

                const { latitude, longitude } = markerCoordinates;

                map.flyTo({
                  center: [longitude, latitude],
                  zoom: ZOOM,
                });
              }}
              size="icon-lg"
              className="rounded-full"
            >
              <MapPinIcon />
            </Button>
            <Button
              onClick={() => {
                const map = mapRef.current;
                if (!map) return;

                navigator.geolocation.getCurrentPosition((position) => {
                  const { latitude, longitude } = position.coords;

                  map.flyTo({
                    bearing: 0,
                    center: [longitude, latitude],
                    zoom: DEFAULT_ZOOM,
                  });
                });
              }}
              size="icon-lg"
              className="rounded-full"
            >
              <NavigationIcon />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <SubmitDialog markerCoordinates={markerCoordinates} photo={photo} />
          </ButtonGroup>
        </ButtonGroup>
      </div>
    </MapLibreMap>
  );
}
