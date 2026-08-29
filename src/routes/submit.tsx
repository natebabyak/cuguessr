import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import exifr from "exifr";
import { LogOutIcon, MapPinIcon } from "lucide-react";
import { useState } from "react";
import { Marker } from "react-map-gl/maplibre";
import z from "zod";
import { AppMap } from "#/components/app-map";
import { GoToCenterButton } from "#/components/go-to-center-button";
import { GoToMarkerButton } from "#/components/go-to-marker-button";
import { GoToMyLocationButton } from "#/components/go-to-my-location-button";
import { MapOverlay } from "#/components/map-overlay";
import { Button, buttonVariants } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import { Input } from "#/components/ui/input";
import { Item, ItemContent, ItemHeader, ItemTitle } from "#/components/ui/item";
import { toast } from "#/components/ui/toast";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "#/lib/constants";
import { calculateDistance } from "#/lib/scoring";
import type { Coordinates } from "#/lib/types";

export const Route = createFileRoute("/submit")({
  component: RouteComponent,
});

const schema = z.object({
  photo: z.file().mime("image/*"),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

function RouteComponent() {
  const form = useForm({
    defaultValues: {
      photo: undefined,
      coordinates: {
        latitude: undefined,
        longitude: undefined,
      },
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: ({ value }) => {
      toast.promise(() => {}, {
        loading: "Submitting photo...",
        success: "Photo submitted",
        error: "Failed to submit photo",
      });
    },
  });

  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [cursorCoordinates, setCursorCoordinates] =
    useState<Coordinates | null>(null);
  const [markerCoordinates, setMarkerCoordinates] =
    useState<Coordinates | null>(null);

  return (
    <AppMap
      cursor={cursor}
      initialViewState={{
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        zoom: DEFAULT_ZOOM,
      }}
      onClick={(e) => {
        const { lat: latitude, lng: longitude } = e.lngLat;

        const distance = calculateDistance({
          a: {
            latitude,
            longitude,
          },
          b: {
            latitude: DEFAULT_LATITUDE,
            longitude: DEFAULT_LONGITUDE,
          },
        });

        if (distance > 2_000) {
          toast.add({
            title: "Location too far from campus",
          });

          return;
        }

        setMarkerCoordinates({
          latitude,
          longitude,
        });
      }}
      onLoad={(e) => e.target.resize()}
      onMouseDown={() => setCursor("grabbing")}
      onMouseMove={(e) => {
        const { lat: latitude, lng: longitude } = e.lngLat;
        setCursorCoordinates({ latitude, longitude });
      }}
      onMouseUp={() => setCursor("crosshair")}
    >
      {markerCoordinates && (
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
          <MapPinIcon className="size-8 animate-in fill-primary text-primary" />
        </Marker>
      )}
      <MapOverlay>
        <Item className="top-0 left-0 bg-background">
          <ItemHeader>
            <ItemTitle>Photo</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <form.Field name="">
              {(field) => (
                <Input
                  accept="image/*"
                  capture="environment"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];

                    if (!file) {
                      toast.add({ title: "No file selected" });
                      return;
                    }

                    if (file.size > 10_000_000) {
                      toast.add({ title: "Image too large (max 10 MB)" });
                      return;
                    }

                    const { latitude, longitude } = await exifr.parse(file);

                    if (!markerCoordinates) {
                      setMarkerCoordinates({
                        latitude,
                        longitude,
                      });

                      toast.add({ title: "Placed marker using photo data" });
                    }
                  }}
                  type="file"
                />
              )}
            </form.Field>
          </ItemContent>
        </Item>
        <Link
          to="/"
          className={buttonVariants({
            size: "icon-lg",
            className: "bottom-0 left-0",
          })}
        >
          <LogOutIcon className="rotate-180" />
        </Link>
        <ButtonGroup orientation="vertical" className="right-0 bottom-0">
          <ButtonGroup orientation="vertical" className="ml-auto">
            <GoToCenterButton />
            <GoToMarkerButton marker={markerCoordinates} />
            <GoToMyLocationButton />
          </ButtonGroup>
          <ButtonGroup>
            <form.Subscribe>
              {({ canSubmit }) => (
                <Button disabled={!canSubmit} type="submit">
                  Submit
                </Button>
              )}
            </form.Subscribe>
          </ButtonGroup>
        </ButtonGroup>
      </MapOverlay>
    </AppMap>
  );
}
