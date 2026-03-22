"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Coordinates } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Check, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";
import { Item, ItemMedia, ItemTitle } from "@/components/ui/item";

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

interface SubmitDialogProps {
  markerCoordinates: Coordinates | null;
  photo: File | null;
}

export function SubmitDialog({ markerCoordinates, photo }: SubmitDialogProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>
          <TriggerButton setOpen={setOpen} />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Submit Photo</DrawerTitle>
            <DrawerDescription>
              You must upload a photo and place a marker on the map to submit.
            </DrawerDescription>
          </DrawerHeader>
          <Content photo={photo} markerCoordinates={markerCoordinates} />
          <DrawerFooter>
            <SubmitButton
              loading={loading}
              setLoading={setLoading}
              setOpen={setOpen}
              photo={photo}
              markerCoordinates={markerCoordinates}
            />
            <DrawerClose asChild>
              <CloseButton loading={loading} setOpen={setOpen} />
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <TriggerButton setOpen={setOpen} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Photo</DialogTitle>
          <DialogDescription>
            You must upload a photo and place a marker on the map to submit.
          </DialogDescription>
        </DialogHeader>
        <Content photo={photo} markerCoordinates={markerCoordinates} />
        <DialogFooter>
          <DialogClose asChild>
            <CloseButton loading={loading} setOpen={setOpen} />
          </DialogClose>
          <SubmitButton
            loading={loading}
            setLoading={setLoading}
            setOpen={setOpen}
            photo={photo}
            markerCoordinates={markerCoordinates}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TriggerButton({ setOpen }: { setOpen: (open: boolean) => void }) {
  return (
    <Button
      onClick={() => setOpen(true)}
      size="lg"
      className="rounded-full hover:scale-105"
    >
      <Send />
      Submit
    </Button>
  );
}

function Content({
  photo,
  markerCoordinates,
}: {
  photo: File | null;
  markerCoordinates: Coordinates | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Item
        variant="outline"
        className={cn(
          photo
            ? "border-green-500/50 bg-green-500/10"
            : "border-red-500/50 bg-red-500/10",
        )}
      >
        <ItemMedia variant="icon" className="border-inherit bg-inherit">
          {photo ? <Check /> : <X />}
        </ItemMedia>
        <ItemTitle>{photo ? "Photo Uploaded" : "No Photo Uploaded"}</ItemTitle>
      </Item>
      <Item
        variant="outline"
        className={cn(
          markerCoordinates
            ? "border-green-500/50 bg-green-500/10"
            : "border-red-500/50 bg-red-500/10",
        )}
      >
        <ItemMedia variant="icon" className="border-inherit bg-inherit">
          {markerCoordinates ? <Check /> : <X />}
        </ItemMedia>
        <ItemTitle>
          {markerCoordinates ? "Marker Placed" : "No Marker Placed"}
        </ItemTitle>
      </Item>
    </div>
  );
}

function SubmitButton({
  loading,
  setLoading,
  setOpen,
  photo,
  markerCoordinates,
}: {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setOpen: (open: boolean) => void;
  photo: File | null;
  markerCoordinates: Coordinates | null;
}) {
  const router = useRouter();

  const submitPhoto = async () => {
    if (!photo || !markerCoordinates) return;

    if (!ALLOWED_TYPES.includes(photo.type)) {
      toast.error("Unsupported file type. Use JPEG, PNG, WebP or HEIC.");
      return;
    }

    if (photo.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("photo", photo);
    formData.append("latitude", String(markerCoordinates.latitude));
    formData.append("longitude", String(markerCoordinates.longitude));

    try {
      const res = await fetch("/api/submit-photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong.");
        return;
      }

      toast.success("Photo uploaded successfully!");
      router.replace("/");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Button
      disabled={loading || !photo || !markerCoordinates}
      onClick={submitPhoto}
      size="sm"
      className="hover:scale-105"
    >
      {loading ? <Spinner /> : <Send />}
      Submit
    </Button>
  );
}

function CloseButton({
  loading,
  setOpen,
}: {
  loading: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Button
      disabled={loading}
      onClick={() => setOpen(false)}
      size="sm"
      variant="outline"
      className="hover:scale-105"
    >
      <X />
      Close
    </Button>
  );
}
