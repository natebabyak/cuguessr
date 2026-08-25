"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

export function PhotoDialog({ imageSrc }: { imageSrc: string }) {
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open} showSwipeHandle>
        <DrawerTrigger render={<PhotoDialogTrigger />} />
        <DrawerContent>
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
        <PhotoDialogLightbox />
        <DialogFooter>
          <DialogClose render={<PhotoDialogClose />} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function PhotoDialogTrigger() {
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

  function PhotoDialogLightbox() {
    return (
      <Gallery>
        <Item original={imageSrc} thumbnail={imageSrc} width="100" height="100">
          {({ ref, open }) => (
            <Image alt="cuGuessr" onClick={open} ref={ref} src={imageSrc} />
          )}
        </Item>
      </Gallery>
    );
  }

  function PhotoDialogClose() {
    return (
      <Button onClick={() => setOpen(false)} size="sm" variant="outline">
        Done
      </Button>
    );
  }
}
