"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import {
  Check,
  Home,
  ImageIcon,
  LocateFixed,
  Navigation,
  Sparkles,
} from "lucide-react";
import { Map, MapLayerMouseEvent, Marker, useMap } from "react-map-gl/maplibre";
import { ChangeEvent, useState } from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { earthDistance } from "@/lib/math";
import { toast } from "sonner";
import { PhotoCard } from "./photo-card";

export default function Page() {
  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [cursorLatitude, setCursorLatitude] = useState<number | null>(null);
  const [cursorLongitude, setCursorLongitude] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [markerLatitude, setMarkerLatitude] = useState<number | null>(null);
  const [markerLongitude, setMarkerLongitude] = useState<number | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const isMobile = useIsMobile();

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
        onClick={(event: MapLayerMouseEvent) => {
          const { lat, lng } = event.lngLat;
          setMarkerLatitude(lat);
          setMarkerLongitude(lng);
        }}
        onMouseDown={() => {
          setCursor("grabbing");
        }}
        onMouseMove={(event: MapLayerMouseEvent) => {
          const { lat, lng } = event.lngLat;
          setCursorLatitude(lat);
          setCursorLongitude(lng);
        }}
        onMouseUp={() => {
          setCursor("crosshair");
        }}
      >
        {markerLatitude && markerLongitude && (
          <Marker
            draggable={true}
            latitude={markerLatitude}
            longitude={markerLongitude}
            onDrag={() => {
              setMarkerLatitude(cursorLatitude);
              setMarkerLongitude(cursorLongitude);
            }}
          >
            <LocateFixed className="text-[#e91c24]" />
          </Marker>
        )}
        <PhotoCard setPhoto={setPhoto} />
        <Button
          asChild
          size="icon"
          className="absolute z-10 rounded-full left-4 bottom-12"
        >
          <Link href="/">
            <Home />
          </Link>
        </Button>
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

function MapButtonGroup({
  markerLatitude,
  markerLongitude,
  photo,
  setMarkerLatitude,
  setMarkerLongitude,
}: {
  markerLatitude: number | null;
  markerLongitude: number | null;
  photo: File | null;
  setMarkerLatitude: (value: number) => void;
  setMarkerLongitude: (value: number) => void;
}) {
  const { current: map } = useMap();

  return (
    <ButtonGroup
      orientation="vertical"
      className="absolute z-10 bottom-12 right-4"
    >
      <ButtonGroup orientation="vertical" className="ml-auto">
        <Button
          onClick={() => {
            navigator.geolocation.getCurrentPosition((position) => {
              if (!map) return;
              const { latitude, longitude } = position.coords;
              map.flyTo({
                center: [longitude, latitude],
                zoom: DEFAULT_ZOOM,
              });
              const distance = earthDistance(
                { latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE },
                { latitude, longitude }
              );
              if (distance <= 10_000) {
                setMarkerLatitude(latitude);
                setMarkerLongitude(longitude);
              }
            });
          }}
          size="icon"
          className="rounded-full"
        >
          <Sparkles />
        </Button>
        <Button
          onClick={() => {
            if (map) {
              map.flyTo({
                center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
                zoom: DEFAULT_ZOOM,
              });
            }
          }}
          size="icon"
          className="rounded-full"
        >
          <Navigation className={cn()} />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button
          disabled={!(photo && markerLatitude && markerLongitude)}
          onClick={async () => {
            const supabase = createClient();
            const { error } = await supabase.from("photos").insert([
              {
                latitude: markerLatitude!,
                longitude: markerLongitude!,
                photo,
              },
            ]);
          }}
          className="rounded-full"
        >
          <Check />
          Done
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
