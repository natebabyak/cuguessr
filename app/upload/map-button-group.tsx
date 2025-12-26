import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { earthDistance } from "@/lib/math";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Check, Locate, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMap } from "react-map-gl/maplibre";
import { toast } from "sonner";

interface MapButtonGroupProps {
  markerLatitude: number | null;
  markerLongitude: number | null;
  photo: File | null;
  setMarkerLatitude: (value: number) => void;
  setMarkerLongitude: (value: number) => void;
}

interface LocateButtonProps {
  setMarkerLatitude: (value: number) => void;
  setMarkerLongitude: (value: number) => void;
}

interface SubmitButtonProps {
  markerLatitude: number | null;
  markerLongitude: number | null;
  photo: File | null;
}

export function MapButtonGroup({
  markerLatitude,
  markerLongitude,
  photo,
  setMarkerLatitude,
  setMarkerLongitude,
}: MapButtonGroupProps) {
  return (
    <ButtonGroup
      orientation="vertical"
      className="absolute z-10 bottom-12 right-4"
    >
      <ButtonGroup orientation="vertical" className="ml-auto">
        <LocateButton
          setMarkerLatitude={setMarkerLatitude}
          setMarkerLongitude={setMarkerLongitude}
        />
        <NavigationButton />
      </ButtonGroup>
      <ButtonGroup>
        <SubmitButton
          markerLatitude={markerLatitude}
          markerLongitude={markerLongitude}
          photo={photo}
        />
      </ButtonGroup>
    </ButtonGroup>
  );
}

function LocateButton({
  setMarkerLatitude,
  setMarkerLongitude,
}: LocateButtonProps) {
  const { current: map } = useMap();

  const handleClick = () => {
    const MAX_DISTANCE = 5_000;

    if (!map) return;

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      map.flyTo({
        center: [longitude, latitude],
        zoom: DEFAULT_ZOOM,
      });

      const distance = earthDistance(
        { latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE },
        { latitude, longitude }
      );

      if (distance > MAX_DISTANCE) {
        toast.error("");

        return;
      }

      if (distance <= 10_000) {
        setMarkerLatitude(latitude);
        setMarkerLongitude(longitude);
      }
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

  const handleClick = () => {
    if (!map) return;

    map.flyTo({
      center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
      zoom: DEFAULT_ZOOM,
    });
  };

  return (
    <Button onClick={handleClick} size="icon" className="rounded-full">
      <Navigation className={cn()} />
    </Button>
  );
}

function SubmitButton({
  markerLatitude,
  markerLongitude,
  photo,
}: SubmitButtonProps) {
  const router = useRouter();

  const handleClick = async () => {
    const supabase = createClient();

    const { error } = await supabase.from("photos").insert([
      {
        latitude: markerLatitude,
        longitude: markerLongitude,
        photo,
      },
    ]);

    if (error) {
      toast.error("Something Went Wrong", {
        action: {
          label: <Check />,
          onClick: () => toast.dismiss(),
        },
      });

      return;
    }

    toast.success("Photo Uploaded Successfully", {
      action: {
        label: <Check />,
        onClick: () => toast.dismiss(),
      },
    });

    router.push("/");
  };

  return (
    <Button
      disabled={!photo || !markerLatitude || !markerLongitude}
      onClick={handleClick}
      className="rounded-full"
    >
      <Check />
      Submit
    </Button>
  );
}
