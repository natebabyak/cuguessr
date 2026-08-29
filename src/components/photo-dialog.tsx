import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "#/components/ui/drawer";
import { useIsMobile } from "#/hooks/use-mobile";

const TITLE = "Where was this photo taken?";
const DESCRIPTION = "Click on the image to zoom in.";

const PHOTOS_URL = import.meta.env.VITE_PHOTOS_URL;

export function PhotoDialog({
  objectKey,
  height,
  width,
}: {
  objectKey: string;
  height: number;
  width: number;
}) {
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(true);

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger render={<PhotoDialogTrigger />} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{TITLE}</DrawerTitle>
            <DrawerDescription>{DESCRIPTION}</DrawerDescription>
          </DrawerHeader>
          <PhotoDialogLightbox />
          <DrawerFooter>
            <DrawerClose render={<PhotoDialogClose />} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<PhotoDialogTrigger />} />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{TITLE}</DialogTitle>
          <DialogDescription>{DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <PhotoDialogLightbox />
        <DialogFooter>
          <DialogClose render={<PhotoDialogClose />} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function PhotoDialogTrigger() {
    return (
      <Button onClick={() => setOpen(true)} size="lg">
        <ImageIcon />
        View Photo
      </Button>
    );
  }

  function PhotoDialogLightbox() {
    return (
      <Gallery>
        <Item
          height={height}
          original={`${PHOTOS_URL}/${objectKey}`}
          thumbnail={`${PHOTOS_URL}/${objectKey}`}
          width={width}
        >
          {({ ref, open }) => (
            <button
              onClick={open}
              type="button"
              className="block w-full cursor-zoom-in overflow-hidden rounded-lg border-0 bg-transparent p-0"
            >
              <img
                alt="round location"
                height={height}
                ref={ref}
                src={`${PHOTOS_URL}/${objectKey}`}
                style={{ aspectRatio: `${width} / ${height}` }}
                width={width}
                className="h-auto w-full rounded-lg object-cover"
              />
            </button>
          )}
        </Item>
      </Gallery>
    );
  }

  function PhotoDialogClose() {
    return (
      <Button onClick={() => setOpen(false)} size="lg">
        Done
      </Button>
    );
  }
}
