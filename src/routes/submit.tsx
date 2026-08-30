import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import exifr from "exifr";
import { ArrowLeftIcon, ImageIcon, MapPinIcon, SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Marker } from "react-map-gl/maplibre";
import z from "zod";
import { AppMap } from "#/components/app-map";
import { GoToCenterButton } from "#/components/go-to-center-button";
import { GoToMarkerButton } from "#/components/go-to-marker-button";
import { GoToMyLocationButton } from "#/components/go-to-my-location-button";
import { MapOverlay } from "#/components/map-overlay";
import { Button, buttonVariants } from "#/components/ui/button";
import { ButtonGroup } from "#/components/ui/button-group";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { Input } from "#/components/ui/input";
import { Item, ItemContent } from "#/components/ui/item";
import { Spinner } from "#/components/ui/spinner";
import { toast } from "#/components/ui/toast";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "#/lib/constants";
import { createPhoto } from "#/lib/photo/functions";
import { calculateDistance } from "#/lib/scoring";
import type { Coordinates } from "#/lib/types";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/submit")({
  component: RouteComponent,
});

const schema = z.object({
  photo: z.file(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

function RouteComponent() {
  const form = useForm({
    defaultValues: {
      photo: undefined as unknown as File,
      latitude: undefined as unknown as number,
      longitude: undefined as unknown as number,
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createPhoto({
          data: {
            photo: value.photo,
            latitude: value.latitude,
            longitude: value.longitude,
          },
        });
        form.reset();
        setMarkerCoordinates(null);
        setPhotoFile(null);
        toast.add({
          title: "Photo submitted for review",
          type: "success",
        });
      } catch (error) {
        toast.add({
          title:
            error instanceof Error ? error.message : "Failed to submit photo",
          type: "error",
        });
      }
    },
  });

  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");
  const [markerCoordinates, setMarkerCoordinates] =
    useState<Coordinates | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [photoFile]);

  async function handlePhoto(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.add({ title: "Please choose an image file" });
      return;
    }

    if (file.size > 10_000_000) {
      toast.add({ title: "Image too large (max 10 MB)" });
      return;
    }

    form.setFieldValue("photo", file);
    setPhotoFile(file);

    try {
      const metadata = await exifr.parse(file, { gps: true });

      if (
        !markerCoordinates &&
        typeof metadata?.latitude === "number" &&
        typeof metadata?.longitude === "number" &&
        calculateDistance({
          a: {
            latitude: metadata.latitude,
            longitude: metadata.longitude,
          },
          b: {
            latitude: DEFAULT_LATITUDE,
            longitude: DEFAULT_LONGITUDE,
          },
        }) <= 2_000
      ) {
        const coordinates = {
          latitude: metadata.latitude,
          longitude: metadata.longitude,
        };
        setMarkerCoordinates(coordinates);
        form.setFieldValue("latitude", metadata.latitude);
        form.setFieldValue("longitude", metadata.longitude);
        toast.add({ title: "Placed marker using photo data" });
      }
    } catch {
      // GPS metadata is optional; the map remains the source of truth.
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
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

          const coordinates = { latitude, longitude };
          setMarkerCoordinates(coordinates);
          form.setFieldValue("latitude", latitude);
          form.setFieldValue("longitude", longitude);
        }}
        onLoad={(e) => e.target.resize()}
        onMouseDown={() => setCursor("grabbing")}
        onMouseUp={() => setCursor("crosshair")}
      >
        {markerCoordinates && (
          <Marker
            anchor="bottom"
            draggable={true}
            latitude={markerCoordinates.latitude}
            longitude={markerCoordinates.longitude}
            onDrag={(event) => {
              const { lat: latitude, lng: longitude } = event.lngLat;
              const distance = calculateDistance({
                a: { latitude, longitude },
                b: {
                  latitude: DEFAULT_LATITUDE,
                  longitude: DEFAULT_LONGITUDE,
                },
              });

              if (distance > 2_000) return;

              const coordinates = { latitude, longitude };
              setMarkerCoordinates(coordinates);
              form.setFieldValue("latitude", latitude);
              form.setFieldValue("longitude", longitude);
            }}
          >
            <MapPinIcon className="size-8 fill-white text-red-500 dark:fill-black" />
          </Marker>
        )}
        <MapOverlay>
          <Item className="top-0 left-0 w-fit bg-background">
            <ItemContent>
              <form.Field name="photo">
                {(field) => (
                  <label
                    htmlFor="photo-upload"
                    className="block cursor-pointer"
                  >
                    <Empty
                      className={cn(
                        "min-h-40 border border-dashed bg-background p-6",
                        isDraggingPhoto && "border-primary",
                      )}
                      onDragEnter={(event) => {
                        event.preventDefault();
                        setIsDraggingPhoto(true);
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDragLeave={(event) => {
                        if (event.currentTarget === event.target) {
                          setIsDraggingPhoto(false);
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        setIsDraggingPhoto(false);
                        handlePhoto(event.dataTransfer.files[0]);
                      }}
                    >
                      <EmptyHeader>
                        {photoPreviewUrl ? (
                          <img
                            src={photoPreviewUrl}
                            alt={field.state.value?.name ?? "Selected photo"}
                            className="size-32 rounded-xl object-cover"
                          />
                        ) : (
                          <EmptyMedia variant="icon">
                            <ImageIcon />
                          </EmptyMedia>
                        )}
                        <EmptyTitle>
                          {field.state.value ? "Photo selected" : "Add a photo"}
                        </EmptyTitle>
                        <EmptyDescription>
                          {field.state.value?.name ??
                            "Drop an image here or click to choose one"}
                        </EmptyDescription>
                      </EmptyHeader>
                      <Input
                        id="photo-upload"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        onChange={(event) => {
                          handlePhoto(event.target.files?.[0]);
                          event.target.value = "";
                        }}
                        type="file"
                      />
                    </Empty>
                  </label>
                )}
              </form.Field>
            </ItemContent>
          </Item>
          <Link
            to="/"
            className={buttonVariants({
              size: "icon-lg",
              className: "bottom-8 left-0",
            })}
          >
            <ArrowLeftIcon />
          </Link>
          <ButtonGroup orientation="vertical" className="right-0 bottom-8">
            <ButtonGroup orientation="vertical" className="ml-auto">
              <GoToCenterButton />
              <GoToMarkerButton marker={markerCoordinates} />
              <GoToMyLocationButton />
            </ButtonGroup>
            <ButtonGroup>
              <form.Subscribe
                selector={(state) => ({
                  isSubmitting: state.isSubmitting,
                  hasPhoto: Boolean(state.values.photo),
                  hasCoordinates:
                    typeof state.values.latitude === "number" &&
                    typeof state.values.longitude === "number",
                })}
              >
                {({ hasCoordinates, hasPhoto, isSubmitting }) => (
                  <Button
                    disabled={!hasPhoto || !hasCoordinates || isSubmitting}
                    size="lg"
                    type="submit"
                  >
                    {isSubmitting ? <Spinner /> : <SendIcon />}
                    Submit Photo
                  </Button>
                )}
              </form.Subscribe>
            </ButtonGroup>
          </ButtonGroup>
        </MapOverlay>
      </AppMap>
    </form>
  );
}
