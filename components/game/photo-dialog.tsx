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
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const TITLE_CONTENT = "Where is this?";
const DESCRIPTION_CONTENT = "Guess where this photo was taken from";
const SUPABASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/`;

interface PhotoDialogProps {
  imagePath: string;
}

export function PhotoDialog({ imagePath }: PhotoDialogProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isShortScreen =
    typeof window !== "undefined" && window.innerHeight < 500;

  return (
    <>
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[
          { src: `${SUPABASE_URL}${imagePath}`, width: 768, height: 768 },
        ]}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
        plugins={[Zoom]}
      />
      <div className="pointer-events-auto self-end justify-self-start">
        <div className="hidden">
          <Photo />
        </div>
        {isMobile ? (
          <Drawer onOpenChange={setOpen} open={open}>
            <DrawerTrigger asChild>
              <TriggerButton />
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{TITLE_CONTENT}</DrawerTitle>
                <DrawerDescription>{DESCRIPTION_CONTENT}</DrawerDescription>
              </DrawerHeader>
              <div className="px-2">
                <Photo />
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button
                    onClick={() => setOpen(false)}
                    size="sm"
                    variant="outline"
                  >
                    <X />
                    Close
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
              <TriggerButton />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{TITLE_CONTENT}</DialogTitle>
                {!isShortScreen && (
                  <DialogDescription>{DESCRIPTION_CONTENT}</DialogDescription>
                )}
              </DialogHeader>
              <Photo />
              {!isShortScreen && (
                <DialogFooter>
                  <DialogClose asChild>
                    <CloseButton />
                  </DialogClose>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );

  function TriggerButton() {
    return (
      <Button onClick={() => setOpen(true)} size="lg" className="rounded-full">
        <ImageIcon />
        View Photo
      </Button>
    );
  }

  function Photo() {
    return (
      <div className="flex size-full items-center justify-center">
        <Spinner className={cn("block", imageLoaded && "hidden")} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${SUPABASE_URL}${imagePath}`}
          alt="Photo"
          width={768}
          height={768}
          onClick={() => setLightboxOpen(true)}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "hidden max-h-[60vh] cursor-zoom-in rounded-md object-cover",
            imageLoaded && "block",
            isShortScreen && "max-h-[50vh]",
          )}
        />
      </div>
    );
  }

  function CloseButton() {
    return (
      <Button onClick={() => setOpen(false)} size="sm" variant="outline">
        <X />
        Close
      </Button>
    );
  }
}
