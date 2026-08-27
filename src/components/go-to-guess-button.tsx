import { LocateFixedIcon } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import type { Coordinates } from "@/lib/types";

export function GoToGuessButton({ guess }: { guess: Coordinates | null }) {
  const map = useMap();

  function goToGuess() {
    if (!guess) return;

    map.current?.flyTo({
      center: [guess.longitude, guess.latitude],
      zoom: 20,
    });
  }

  return (
    <Button
      disabled={!guess}
      onClick={goToGuess}
      size="icon-lg"
      className="pointer-events-auto rounded-full"
    >
      <LocateFixedIcon />
    </Button>
  );
}
