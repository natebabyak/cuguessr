import type { Feature, LineString } from "geojson";
import { MapPinCheckInsideIcon } from "lucide-react";
import { useState } from "react";
import { Layer, Marker, Source } from "react-map-gl/maplibre";
import { useRoundResultAnimation } from "../../../lib/OLD-TO-DELETE/use-round-result-animation";
import type { Coordinates } from "../../../lib/types";

export function RoundResultOverlay({
  isRoundOver,
  guess,
  answer,
}: {
  isRoundOver: boolean;
  guess: Coordinates | null;
  answer: Coordinates | null;
}) {
  const [lineProgress, setLineProgress] = useState(0);

  useRoundResultAnimation({
    isRoundOver,
    guess,
    answer,
    setLineProgress,
  });

  if (!isRoundOver || !guess || !answer) {
    return null;
  }

  const longitude =
    guess.longitude + (answer.longitude - guess.longitude) * lineProgress;

  const latitude =
    guess.latitude + (answer.latitude - guess.latitude) * lineProgress;

  const lineGeoJson: Feature<LineString> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [guess.longitude, guess.latitude],
        [longitude, latitude],
      ],
    },
  };

  return (
    <>
      <Marker
        anchor="bottom"
        latitude={answer.latitude}
        longitude={answer.longitude}
      >
        <MapPinCheckInsideIcon className="size-8 fill-white text-green-500 dark:fill-black" />
      </Marker>

      <Source id="line" type="geojson" data={lineGeoJson}>
        <Layer
          id="line-layer"
          type="line"
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
          paint={{
            "line-color": "#fff",
            "line-width": 3,
            "line-dasharray": [0, 2],
          }}
        />
      </Source>
    </>
  );
}
