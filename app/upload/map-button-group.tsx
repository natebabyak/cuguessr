import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Check, Locate, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { Coordinates } from "@/lib/math";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMap } from "react-map-gl/maplibre";

interface MapButtonGroupProps {
  markerCoordinates: Coordinates | null;
  photo: File | null;
}

interface SubmitButtonProps {
  markerCoordinates: Coordinates | null;
  photo: File | null;
}

export function MapButtonGroup({
  markerCoordinates,
  photo,
}: MapButtonGroupProps) {
  return (
    <ButtonGroup
      orientation="vertical"
      className="absolute z-10 md:bottom-12 md:right-4 right-2 bottom-10"
    >
      <ButtonGroup orientation="vertical" className="ml-auto">
        <LocateButton />
        <NavigationButton />
      </ButtonGroup>
      <ButtonGroup>
        <SubmitButton markerCoordinates={markerCoordinates} photo={photo} />
      </ButtonGroup>
    </ButtonGroup>
  );
}

function LocateButton() {
  const { current: map } = useMap();

  const handleClick = () => {
    if (!map) return;

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      map.flyTo({
        center: [longitude, latitude],
        zoom: 20,
      });
    });
  };

  return (
    <Button onClick={handleClick} size="icon" className="rounded-full">
      <Locate />
    </Button>
  );
}

function NavigationButton() {
  const { current: map } = useMap();

  const isCentered = () => {
    if (!map) return false;

    const { lat, lng } = map.getCenter();

    return lat === DEFAULT_LATITUDE && lng === DEFAULT_LONGITUDE;
  };

  const handleClick = () => {
    if (!map) return;

    map.flyTo({
      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      zoom: DEFAULT_ZOOM,
    });
  };

  return (
    <Button onClick={handleClick} size="icon" className="rounded-full">
      <Navigation className={cn(isCentered() && "fill-primary")} />
    </Button>
  );
}

function SubmitButton({ markerCoordinates, photo }: SubmitButtonProps) {
  const router = useRouter();

  const handleClick = async () => {
    if (!photo) {
      toast.error("No Photo Uploaded");
      return;
    }

    if (!markerCoordinates) {
      toast.error("No Marker Placed");
      return;
    }

    const supabase = createClient();
    const uuid = crypto.randomUUID();
    const extension = photo.name.split(".").pop()?.toLowerCase();

    const { data: storageData, error: storageError } = await supabase.storage
      .from("photos")
      .upload(`${uuid}.${extension}`, photo, {
        contentType: photo.type,
      });

    if (storageError) {
      toast.error("Something Went Wrong", {
        description: storageError.message,
      });
      return;
    }

    const { latitude, longitude } = markerCoordinates;

    const { error: insertError } = await supabase.from("photos").insert([
      {
        image_path: storageData.path,
        latitude,
        longitude,
      },
    ]);

    if (insertError) {
      toast.error("Something Went Wrong");
      return;
    }

    toast.success("Photo Uploaded Successfully");
    router.push("/");
  };

  return (
    <Button onClick={handleClick} className="rounded-full">
      <Check />
      Submit
    </Button>
  );
}
