import { useForm, useStore } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { cn } from "cn";
import exifr from "exifr";
import {
  ArrowLeft,
  Image,
  LoaderCircle,
  LocateFixed,
  MapPin,
  MapPinSearch,
  Navigation,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Marker, type MapRef } from "react-map-gl/maplibre";
import z from "zod";

import { AppMap } from "#/components/app-map";
import { Button, buttonVariants } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import { FieldError } from "#/components/ui/field";
import { Item, ItemContent } from "#/components/ui/item";
import { toast } from "#/components/ui/toast";
import { DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ZOOM } from "#/lib/constants";

export const Route = createFileRoute("/submit")({
  component: RouteComponent,
});

const PhotoSchema = z
  .file()
  .max(10 * 1024 * 1024, "Choose an image no larger than 10 MiB.")
  .refine((file) => file.type.startsWith("image/"), "Choose an image file.");

const Schema = z
  .object({
    photo: PhotoSchema.nullable().refine((photo) => photo !== null, "Select a photo."),
    lat: z.number().min(-90).max(90).nullable(),
    lng: z.number().min(-180).max(180).nullable(),
  })
  .refine(({ lat, lng }) => lat !== null && lng !== null && isCampusLocation({ lat, lng }), {
    message: "Choose a location within 2 km of campus.",
    path: ["lat"],
  });

type Coordinates = { lat: number; lng: number };
type FormValues = { photo: File | null; lat: number | null; lng: number | null };

function isCampusLocation({ lat, lng }: Coordinates) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return false;
  }

  const radians = Math.PI / 180;
  const a =
    Math.sin(((lat - DEFAULT_LAT) * radians) / 2) ** 2 +
    Math.cos(lat * radians) *
      Math.cos(DEFAULT_LAT * radians) *
      Math.sin(((lng - DEFAULT_LNG) * radians) / 2) ** 2;

  return 2 * 6_371_000 * Math.asin(Math.sqrt(Math.min(1, a))) <= 2_000;
}

function RouteComponent() {
  const mapRef = useRef<MapRef>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoRequest = useRef(0);
  const locationRequest = useRef(0);
  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { photo: null, lat: null, lng: null } as FormValues,
    validators: {
      onSubmit: Schema,
    },
    onSubmit: () => {
      toast.add({ title: "Photo uploads aren’t available yet.", type: "info" });
    },
  });

  const { photo, lat, lng } = useStore(form.store, (state) => state.values);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const marker = lat !== null && lng !== null ? { lat, lng } : null;

  useEffect(() => {
    if (!thumbnailUrl) return;
    return () => URL.revokeObjectURL(thumbnailUrl);
  }, [thumbnailUrl]);

  useEffect(() => {
    return () => {
      photoRequest.current += 1;
      locationRequest.current += 1;
    };
  }, []);

  function setLocation(coordinates: Coordinates) {
    if (!isCampusLocation(coordinates)) {
      toast.add({
        title: "Location too far from campus",
        description: "Choose a location within 2 km of campus.",
        type: "warning",
      });
      return false;
    }

    photoRequest.current += 1;
    form.setFieldValue("lat", coordinates.lat);
    form.setFieldValue("lng", coordinates.lng);
    return true;
  }

  async function selectPhoto(file: File) {
    const request = ++photoRequest.current;
    const result = PhotoSchema.safeParse(file);

    if (!result.success) {
      setPhotoError(result.error.issues[0].message);
      return;
    }

    setPhotoError(null);
    form.setFieldValue("photo", file);
    setThumbnailUrl(URL.createObjectURL(file));

    if (form.state.values.lat !== null) return;

    try {
      const gps = await exifr.gps(file);
      if (request !== photoRequest.current || form.state.values.lat !== null || !gps) return;

      const coordinates = { lat: gps.latitude, lng: gps.longitude };
      if (isCampusLocation(coordinates)) setLocation(coordinates);
    } catch {
      // Photos without readable GPS metadata can be positioned manually.
    }
  }

  function goToLocation() {
    if (!navigator.geolocation) {
      toast.add({ title: "Your browser doesn’t support geolocation.", type: "error" });
      return;
    }

    const request = ++locationRequest.current;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (request !== locationRequest.current) return;
        setIsLocating(false);
        mapRef.current?.flyTo({ center: [coords.longitude, coords.latitude], zoom: DEFAULT_ZOOM });
      },
      (error) => {
        if (request !== locationRequest.current) return;
        setIsLocating(false);
        toast.add({
          title: error.code === 1 ? "Location access was denied." : "Couldn’t find your location.",
          description: "You can still choose a photo location on the map.",
          type: "error",
        });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <AppMap
        ref={mapRef}
        cursor={cursor}
        initialViewState={{
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LNG,
          zoom: DEFAULT_ZOOM,
        }}
        onClick={(event) => setLocation({ lat: event.lngLat.lat, lng: event.lngLat.lng })}
        onLoad={(event) => event.target.resize()}
        onMouseDown={() => setCursor("grabbing")}
        onMouseUp={() => setCursor("crosshair")}
        onMouseOut={() => setCursor("crosshair")}
      >
        {marker && (
          <Marker
            anchor="bottom"
            draggable
            latitude={marker.lat}
            longitude={marker.lng}
            onClick={(event) => event.originalEvent.stopPropagation()}
            onDragStart={() => {
              photoRequest.current += 1;
              setCursor("grabbing");
            }}
            onDragEnd={(event) => {
              setCursor("crosshair");
              if (!setLocation({ lat: event.lngLat.lat, lng: event.lngLat.lng })) {
                event.target.setLngLat([marker.lng, marker.lat]);
              }
            }}
          >
            <MapPin
              aria-label="Photo location"
              className="text-primary size-8 fill-white dark:fill-black"
            />
          </Marker>
        )}
        <Link
          to="/"
          className={cn(
            "absolute top-4 left-4 w-fit",
            buttonVariants({
              size: "lg",
            }),
          )}
        >
          <ArrowLeft />
          Back
        </Link>
        <Item
          className="bg-background absolute top-4 right-4 max-h-[calc(100dvh-14rem)] w-[min(18rem,calc(100vw-8rem))] overflow-y-auto shadow-md"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
          <ItemContent>
            <button
              type="button"
              aria-controls="photo"
              aria-describedby={photoError ? "photo-help photo-error" : "photo-help"}
              aria-invalid={Boolean(photoError)}
              onClick={() => photoInputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDraggingPhoto(true);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setIsDraggingPhoto(false);
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsDraggingPhoto(false);
                const file = event.dataTransfer.files[0];
                if (file) void selectPhoto(file);
              }}
              className={cn(
                "flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-border p-4 text-center outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                isDraggingPhoto && "border-primary bg-primary/5",
              )}
            >
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Selected photo preview"
                  draggable={false}
                  className="max-h-28 w-25 rounded-md object-contain"
                />
              ) : (
                <span className="bg-muted flex size-10 items-center justify-center rounded-lg">
                  <Image aria-hidden="true" className="size-6" />
                </span>
              )}
              <span className="font-medium">{photo ? "Photo selected" : "Select a photo"}</span>
              <span id="photo-help" className="text-muted-foreground text-sm">
                Drop an image here or click to select one. Up to 10 MiB.
              </span>
            </button>
            <input
              ref={photoInputRef}
              id="photo"
              type="file"
              accept="image/*"
              capture="environment"
              aria-label="Select a photo"
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) void selectPhoto(file);
                event.currentTarget.value = "";
              }}
            />
            {photoError && <FieldError id="photo-error">{photoError}</FieldError>}
          </ItemContent>
        </Item>
        <div
          className="absolute right-4 bottom-14 flex flex-col items-end gap-4"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
          <ButtonGroup orientation="vertical" aria-label="Map controls">
            <Button
              type="button"
              size="icon-lg"
              aria-label="Recenter on campus"
              title="Recenter on campus"
              onClick={() =>
                mapRef.current?.flyTo({ center: [DEFAULT_LNG, DEFAULT_LAT], zoom: DEFAULT_ZOOM })
              }
            >
              <LocateFixed />
            </Button>
            <Button
              type="button"
              size="icon-lg"
              disabled={!marker}
              aria-label="Go to photo location"
              title="Go to photo location"
              onClick={() => {
                if (marker)
                  mapRef.current?.flyTo({ center: [marker.lng, marker.lat], zoom: DEFAULT_ZOOM });
              }}
            >
              <MapPinSearch />
            </Button>
            <Button
              type="button"
              size="icon-lg"
              disabled={isLocating}
              aria-label={isLocating ? "Finding your location" : "Go to my location"}
              title="Go to my location"
              onClick={goToLocation}
            >
              {isLocating ? <LoaderCircle className="animate-spin" /> : <Navigation />}
            </Button>
          </ButtonGroup>
          <Button type="submit" size="lg" disabled={!photo || !marker || isSubmitting}>
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send />}
            Submit Photo
          </Button>
        </div>
      </AppMap>
    </form>
  );
}
