import { ImageIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { Gallery, Item } from "react-photoswipe-gallery";
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
import { useIsMobile } from "@/hooks/use-is-mobile";

const TITLE = "Where was this photo taken?";
const DESCRIPTION = "Click on the image to zoom in.";

export function PhotoDialog({
  objectKey,
  height,
  width,
  open,
  onOpenChange,
}: {
  objectKey: string;
  height: number;
  width: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();

  const imageUrl = `${process.env.NEXT_PUBLIC_R2_URL}/photos/${objectKey}`;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger render={<PhotoDialogTrigger />} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{TITLE}</DrawerTitle>
            <DrawerDescription>{DESCRIPTION}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <PhotoDialogLightbox />
          </div>
          <DrawerFooter>
            <DrawerClose render={<PhotoDialogClose />} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<PhotoDialogTrigger />} />
      <DialogContent showCloseButton={false} className="max-h-[90svh]">
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
      <Button onClick={() => onOpenChange(true)} size="lg">
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
          original={imageUrl}
          thumbnail={imageUrl}
          width={width}
        >
          {({ ref, open }) => (
            <button
              onClick={open}
              type="button"
              className="flex max-h-[min(60svh,calc(90svh-12rem))] w-full cursor-zoom-in items-center overflow-hidden rounded-lg border-0 bg-transparent p-0"
            >
              <Image
                alt="round location"
                height={height}
                loading="eager"
                ref={ref}
                src={imageUrl}
                width={width}
                className="h-auto w-full rounded-lg object-cover object-center"
              />
            </button>
          )}
        </Item>
      </Gallery>
    );
  }

  function PhotoDialogClose() {
    return (
      <Button onClick={() => onOpenChange(false)} variant="outline">
        <XIcon />
        Close
      </Button>
    );
  }
}
