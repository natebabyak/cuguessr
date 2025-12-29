import { Button } from "@/components/ui/button";
import { Coordinates } from "@/lib/math";
import { LocateFixed } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";

interface LocateFixedButtonProps {
  guessCoordinates: Coordinates | null;
}

export function LocateFixedButton({
  guessCoordinates,
}: LocateFixedButtonProps) {
  const { current: map } = useMap();

  const handleClick = () => {
    if (!guessCoordinates || !map) return;

    const { latitude, longitude } = guessCoordinates;

    map.flyTo({
      center: [longitude, latitude],
      zoom: 20,
    });
  };

  return (
    <Button disabled={!guessCoordinates} onClick={handleClick} size="icon">
      <LocateFixed />
    </Button>
  );
}
