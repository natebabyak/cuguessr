import { ButtonGroup } from "@/components/ui/button-group";
import { Coordinates } from "@/lib/types";
import { MapStyleButton } from "./map-style-button";
import { CenterButton } from "./center-button";
import { MarkerButton } from "./marker-button";
import { LocationButton } from "./location-button";
import { SubmitDialog } from "./submit-dialog";

interface MapButtonGroupProps {
  markerCoordinates: Coordinates | null;
  photo: File | null;
  mapStyle: "hybrid" | "streets";
  setMapStyle: (style: "hybrid" | "streets") => void;
}

export function SubmitButtonGroup({
  markerCoordinates,
  photo,
  mapStyle,
  setMapStyle,
}: MapButtonGroupProps) {
  return (
    <ButtonGroup
      orientation="vertical"
      className="pointer-events-auto self-end justify-self-end"
    >
      <ButtonGroup className="ml-auto">
        <MapStyleButton mapStyle={mapStyle} setMapStyle={setMapStyle} />
      </ButtonGroup>
      <ButtonGroup orientation="vertical" className="ml-auto">
        <CenterButton />
        <MarkerButton markerCoordinates={markerCoordinates} />
        <LocationButton />
      </ButtonGroup>
      <ButtonGroup>
        <SubmitDialog markerCoordinates={markerCoordinates} photo={photo} />
      </ButtonGroup>
    </ButtonGroup>
  );
}
