import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Check, Locate, Navigation, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Coordinates } from "@/lib/math";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  DEFAULT_ZOOM,
} from "@/lib/constants";
import { toast } from "sonner";
import { useMap } from "react-map-gl/maplibre";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

interface MapButtonGroupProps {
  markerCoordinates: Coordinates | null;
  photo: File | null;
}

interface SubmitDialogProps {
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
        <SubmitDialog markerCoordinates={markerCoordinates} photo={photo} />
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

function SubmitDialog({ markerCoordinates, photo }: SubmitDialogProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleClick = async () => {
    if (!photo || !markerCoordinates) return;

    setLoading(true);

    const supabase = createClient();
    const uuid = crypto.randomUUID();
    const extension = photo.name.split(".").pop()?.toLowerCase();

    const { data: storageData, error: storageError } = await supabase.storage
      .from("photos")
      .upload(`${uuid}.${extension}`, photo, {
        contentType: photo.type,
      });

    if (storageError) {
      toast.error("Something Went Wrong");
      setLoading(false);
      setOpen(false);
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
      setLoading(false);
      setOpen(false);
      return;
    }

    toast.success("Photo Uploaded Successfully");

    router.replace("/");
  };

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>
          <Button className="rounded-full">
            <Check />
            Submit
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Upload Photo</DrawerTitle>
          </DrawerHeader>
          <Content />
          <DrawerFooter>
            <ButtonGroup className="ml-auto">
              <ButtonGroup>
                <SubmitButton />
              </ButtonGroup>
              <ButtonGroup>
                <DialogClose asChild>
                  <CancelButton />
                </DialogClose>
              </ButtonGroup>
            </ButtonGroup>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Check />
          Submit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Photo</DialogTitle>
        </DialogHeader>
        <Content />
        <DialogFooter>
          <ButtonGroup className="ml-auto">
            <ButtonGroup>
              <SubmitButton />
            </ButtonGroup>
            <ButtonGroup>
              <DialogClose asChild>
                <CancelButton />
              </DialogClose>
            </ButtonGroup>
          </ButtonGroup>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function Content() {
    return (
      <div className="flex flex-col gap-4 px-2">
        <div
          className={cn(
            "flex items-center gap-2",
            photo && "text-muted-foreground"
          )}
        >
          {photo ? <Check /> : <X />}
          Photo Uploaded
        </div>
        <div
          className={cn(
            "flex items-center gap-2",
            markerCoordinates && "text-muted-foreground"
          )}
        >
          {markerCoordinates ? <Check /> : <X />}
          Marker Placed
        </div>
      </div>
    );
  }

  function SubmitButton() {
    return (
      <Button
        disabled={loading || !photo || !markerCoordinates}
        onClick={handleClick}
      >
        {loading ? <Spinner /> : <Check />}
        Submit
      </Button>
    );
  }

  function CancelButton() {
    return (
      <Button
        disabled={loading}
        onClick={() => setOpen(false)}
        variant="outline"
      >
        <X />
        Cancel
      </Button>
    );
  }
}
