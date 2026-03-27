"use client";

import "yet-another-react-lightbox/styles.css";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import { ImageIcon, X } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

const DESCRIPTION = "Guess where this photo was taken from";
const R2_URL = "https://pub-27971f31521f454098a11afbc3ec23b6.r2.dev";

interface PhotoDialogProps {
  imagePath: string;
  isRoundOver: boolean;
}

export function PhotoDialog({ imagePath, isRoundOver }: PhotoDialogProps) {
  const TITLE = isRoundOver ? "So that's where it was..." : "Where is this?";

  const isMobile = useIsMobile();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [open, setOpen] = useState(!isRoundOver);

  const imageSrc = `${R2_URL}/${imagePath.replace(/\.[^/.]+$/, "")}.webp`;

  return (
    <>
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: imageSrc }]}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
        plugins={[Zoom]}
      />
      <div className="pointer-events-auto self-end justify-self-start">
        {isMobile ? (
          <Drawer onOpenChange={setOpen} open={open}>
            <DrawerTrigger asChild>
              <TriggerButton setOpen={setOpen} />
            </DrawerTrigger>
            <DrawerContent className="flex max-h-[90dvh] flex-col">
              <DrawerHeader className="shrink-0">
                <DrawerTitle>{TITLE}</DrawerTitle>
                {!isRoundOver && (
                  <DrawerDescription>{DESCRIPTION}</DrawerDescription>
                )}
              </DrawerHeader>
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4">
                <Photo imageSrc={imageSrc} setLightboxOpen={setLightboxOpen} />
              </div>
              <DrawerFooter className="shrink-0">
                <DrawerClose asChild>
                  <CloseButton setOpen={setOpen} />
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
              <TriggerButton setOpen={setOpen} />
            </DialogTrigger>
            <DialogContent className="flex max-h-[80vh] max-w-[80vw] flex-col">
              <DialogHeader className="shrink-0">
                <DialogTitle>{TITLE}</DialogTitle>
                {!isRoundOver && (
                  <DialogDescription>{DESCRIPTION}</DialogDescription>
                )}
              </DialogHeader>
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                <Photo imageSrc={imageSrc} setLightboxOpen={setLightboxOpen} />
              </div>
              <DialogFooter className="shrink-0">
                <DialogClose asChild>
                  <CloseButton setOpen={setOpen} />
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}

function TriggerButton({ setOpen }: { setOpen: (open: boolean) => void }) {
  return (
    <Button
      onClick={() => setOpen(true)}
      size="lg"
      className="rounded-full transition-transform hover:scale-105"
    >
      <ImageIcon />
      View Photo
    </Button>
  );
}

function Photo({
  imageSrc,
  setLightboxOpen,
}: {
  imageSrc: string;
  setLightboxOpen: (open: boolean) => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="grid h-full w-full overflow-hidden rounded-md">
      {!loaded && (
        <div className="col-start-1 row-start-1 flex items-center justify-center p-10">
          <Spinner />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt="Photo"
        onClick={() => setLightboxOpen(true)}
        onLoad={() => setLoaded(true)}
        className={cn(
          "col-start-1 row-start-1 mx-auto my-auto cursor-zoom-in object-cover object-center",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

function CloseButton({ setOpen }: { setOpen: (open: boolean) => void }) {
  return (
    <Button onClick={() => setOpen(false)} size="sm" variant="outline">
      <X />
      Close
    </Button>
  );
}
