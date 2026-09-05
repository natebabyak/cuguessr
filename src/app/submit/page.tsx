"use client";

import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  setInput,
  useForm,
} from "@formisch/react";
import exifr from "exifr";
import { ArrowLeftIcon, ImageIcon, MapPinIcon, SendIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Marker } from "react-map-gl/maplibre";
import { AppMap } from "@/components/app-map";
import { GoToMarkerButton } from "@/components/go-to-marker-button";
import { GoToMyLocationButton } from "@/components/go-to-my-location-button";
import { RecenterButton } from "@/components/recenter-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { Item, ItemContent } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { calculateDistance } from "@/lib/scoring";
import type { Coordinates } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createPhoto } from "./actions";
import { PhotoSchema } from "./photo-schema";

export default function Page() {
  const form = useForm({
    schema: PhotoSchema,
  });

  const handleSubmit: SubmitHandler<typeof PhotoSchema> = async (output) => {
    toast.promise(createPhoto(output), {
      loading: "Submitting...",
      success: "Photo submitted successfully!",
      error: "Failed to submit photo.",
    });
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  ) => {
    onChange(event);

    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setThumbnailUrl(URL.createObjectURL(file));

    if (marker) return;

    try {
      const gps = await exifr.gps(file);
      const latitude = gps?.latitude;
      const longitude = gps?.longitude;

      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return;
      }

      const coordinates = { latitude, longitude };
      const distance = calculateDistance({
        a: coordinates,
        b: {
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
        },
      });

      if (distance > 2_000) return;

      setMarker(coordinates);
      setInput(form, { path: ["latitude"], input: latitude });
      setInput(form, { path: ["longitude"], input: longitude });
    } catch {
      // Images without readable GPS metadata simply do not set a marker.
    }
  };

  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [marker, setMarker] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (!thumbnailUrl) return;

    return () => URL.revokeObjectURL(thumbnailUrl);
  }, [thumbnailUrl]);

  return (
    <Form of={form} onSubmit={handleSubmit}>
      <FormischField of={form} path={["latitude"]}>
        {(field) => <input type="hidden" {...field.props} />}
      </FormischField>
      <FormischField of={form} path={["longitude"]}>
        {(field) => <input type="hidden" {...field.props} />}
      </FormischField>
      <AppMap
        cursor={cursor}
        initialViewState={{
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
          zoom: DEFAULT_ZOOM,
        }}
        onClick={(e) => {
          const distance = calculateDistance({
            a: {
              latitude: e.lngLat.lat,
              longitude: e.lngLat.lng,
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

          const coordinates = {
            latitude: e.lngLat.lat,
            longitude: e.lngLat.lng,
          };

          setMarker(coordinates);
          setInput(form, { path: ["latitude"], input: coordinates.latitude });
          setInput(form, {
            path: ["longitude"],
            input: coordinates.longitude,
          });
        }}
        onLoad={(e) => e.target.resize()}
        onMouseDown={() => setCursor("grabbing")}
        onMouseUp={() => setCursor("crosshair")}
      >
        {marker && (
          <Marker
            anchor="bottom"
            draggable={true}
            latitude={marker.latitude}
            longitude={marker.longitude}
            onDrag={(e) => {
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

              if (distance > 2_000) return;

              const coordinates = { latitude, longitude };

              setMarker(coordinates);
              setInput(form, { path: ["latitude"], input: latitude });
              setInput(form, { path: ["longitude"], input: longitude });
            }}
          >
            <MapPinIcon className="size-8 fill-white text-primary dark:fill-black" />
          </Marker>
        )}
        <div className="pointer-events-none absolute inset-2 *:pointer-events-auto *:absolute md:inset-4">
          <Item className="top-0 left-0 w-fit bg-background">
            <ItemContent>
              <FormischField of={form} path={["photo"]}>
                {(field) => (
                  <label htmlFor="photo">
                    <Empty
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setIsDraggingPhoto(true);
                      }}
                      onDragLeave={(event) => {
                        if (event.currentTarget === event.target) {
                          setIsDraggingPhoto(false);
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingPhoto(false);
                      }}
                      className={cn(
                        "border border-border",
                        isDraggingPhoto && "border-primary",
                      )}
                    >
                      <EmptyHeader>
                        <EmptyMedia variant={thumbnailUrl ? "default" : "icon"}>
                          {thumbnailUrl ? (
                            <Image src={thumbnailUrl} alt="Thumbnail" />
                          ) : (
                            <ImageIcon />
                          )}
                        </EmptyMedia>
                        <EmptyTitle>
                          {field.input ? "Photo selected" : "Select a photo"}
                        </EmptyTitle>
                        <EmptyDescription>
                          Drop an image here or click to select one
                        </EmptyDescription>
                      </EmptyHeader>
                      <input
                        accept="image/*"
                        id="photo"
                        capture="environment"
                        className="sr-only"
                        type="file"
                        {...field.props}
                        onChange={(event) =>
                          handlePhotoChange(event, field.props.onChange)
                        }
                      />
                    </Empty>
                  </label>
                )}
              </FormischField>
            </ItemContent>
          </Item>
          <Link
            href="/"
            className={buttonVariants({
              size: "icon-lg",
              className: "bottom-8 left-0",
            })}
          >
            <ArrowLeftIcon />
          </Link>
          <div className="right-0 bottom-8 flex flex-col items-end">
            <ButtonGroup orientation="vertical" className="ml-auto">
              <RecenterButton />
              <GoToMarkerButton marker={marker} />
              <GoToMyLocationButton />
            </ButtonGroup>
            <Button
              disabled={!marker || form.isSubmitting}
              size="lg"
              type="submit"
            >
              {form.isSubmitting ? <Spinner /> : <SendIcon />}
              Submit Photo
            </Button>
          </div>
        </div>
      </AppMap>
    </Form>
  );
}
