"use client";

import { Form, type SubmitHandler, useForm } from "@formisch/react";
import {
  CompassIcon,
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
import sharp from "sharp";
import * as v from "valibot";
import { SubmitDialog } from "@/components/submit-dialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Item } from "@/components/ui/item";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { db } from "@/lib/db";
import { calculateDistance } from "@/lib/math";
import type { Coordinates } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PhotoSchema, submitPhoto } from "./actions";

const MAX_DISTANCE = 2_000;
const ZOOM = 20;

export default function Page() {
  const photoForm = useForm({
    schema: PhotoSchema,
  });

  const handleSubmit: SubmitHandler<typeof PhotoSchema> = async (output) => {
    const session = await authClient.getSession();
    const userId = session.data?.user.id;

    toast.promise(submitPhoto(output, userId), {
      loading: "Submitting photo...",
      success: "Photo submitted",
      error: "Failed to submit photo",
    });
  };

  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [cursorCoords, setCursorCoords] = useState<Coordinates | null>(null);
  const [markerCoords, setMarkerCoords] = useState<Coordinates | null>(null);

  function handleClick(e: MapLayerMouseEvent) {
    const { lat: latitude, lng: longitude } = e.lngLat;

    if (
      calculateDistance({
        a: {
          latitude,
          longitude,
        },
        b: {
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
        },
      }) > MAX_DISTANCE
    ) {
      toast.add({
        title: "Location too far from campus",
      });

      return;
    }

    setMarkerCoords({
      latitude,
      longitude,
    });
  }

  const handleMouseMove = (event: MapLayerMouseEvent) => {
    const { lat: latitude, lng: longitude } = event.lngLat;

    setCursorCoords({
      latitude,
      longitude,
    });
  };

  const mapRef = useRef<MapRef>(null);

  return (
    <Form of={photoForm} onSubmit={handleSubmit}>
      <MapLibreMap
        cursor={cursor}
        initialViewState={{
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
          zoom: DEFAULT_ZOOM,
        }}
        onClick={handleClick}
        onMouseDown={() => setCursor("grabbing")}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setCursor("crosshair")}
        ref={mapRef}
      >
        {markerCoords && (
          <Marker
            anchor="bottom"
            draggable={true}
            latitude={markerCoords.latitude}
            longitude={markerCoords.longitude}
            onDrag={() => {
              if (!cursorCoords) return;
              setMarkerCoords(cursorCoords);
            }}
          >
            <MapPinIcon fill="#fff" className="size-8 text-primary" />
          </Marker>
        )}
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
                disabled={!markerCoords}
                onClick={() => {
                  const map = mapRef.current;
                  if (!map || !markerCoords) return;

                  const { latitude, longitude } = markerCoords;

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
              <Button />
            </ButtonGroup>
          </ButtonGroup>
        </div>
      </MapLibreMap>
    </Form>
  );
}
