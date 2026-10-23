import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import z from "zod";

import { AppMap } from "#/components/app-map";
import { Button, buttonVariants } from "#/components/ui/button";
import { DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ZOOM } from "#/lib/constants";

export const Route = createFileRoute("/submit")({
  component: RouteComponent,
});

const Schema = z.object({
  photo: z
    .file()
    .mime("image/*")
    .max(10 * 1024 * 1024),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

function RouteComponent() {
  const form = useForm({
    validators: {
      onSubmit: Schema,
    },
  });

  const [cursor, setCursor] = useState<"crosshair" | "grabbing">("crosshair");

  return (
    <form>
      <AppMap
        cursor={cursor}
        initialViewState={{
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LNG,
          zoom: DEFAULT_ZOOM,
        }}
      >
        <Link
          to="/"
          className={cn(
            "inset-4 absolute w-fit shadow-md",
            buttonVariants({
              size: "lg",
            }),
          )}
        >
          <ArrowLeft />
          Back
        </Link>
        <Button type="submit" className="absolute right-4 bottom-14 w-fit shadow-md">
          Submit
        </Button>
      </AppMap>
    </form>
  );
}
