import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Layers2 } from "lucide-react";

export function MapStyleButton({
  mapStyle,
  setMapStyle,
}: {
  mapStyle: "hybrid" | "streets";
  setMapStyle: (value: "hybrid" | "streets") => void;
}) {
  function toggleMapStyle() {
    if (mapStyle === "hybrid") {
      setMapStyle("streets");
    } else {
      setMapStyle("hybrid");
    }
  }

  return (
    <Button onClick={toggleMapStyle} size="icon-lg" className="rounded-full">
      <Layers2
        className={cn(
          mapStyle === "hybrid" &&
            "[&>path:first-child]:fill-primary-foreground",
        )}
      />
    </Button>
  );
}
