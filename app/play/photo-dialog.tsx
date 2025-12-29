import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import { useIsMobile } from "@/hooks/use-mobile";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ImageIcon, X } from "lucide-react";
import { useState } from "react";

const BASE_URL =
  "https://mmxvuwpgycqgbspvmmeo.supabase.co/storage/v1/object/public/photos/";

interface PhotoDialogProps {
  imagePath: string;
}

export function PhotoDialog({ imagePath }: PhotoDialogProps) {
  const [open, setOpen] = useState(true);
  const isMobile = useIsMobile();

  const title = "Where is this?";
  const description = "Guess where this photo was taken from";

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>
          <Trigger />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Photo"
              src={`${BASE_URL}${imagePath}`}
              className="rounded-md"
            />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Close />
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Trigger />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Photo"
          src={`${BASE_URL}${imagePath}`}
          className="rounded-md"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Close />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function Trigger() {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="absolute left-2 bottom-10 md:left-4 md:bottom-12 rounded-full"
      >
        <ImageIcon />
        View Photo
      </Button>
    );
  }

  function Close() {
    return (
      <Button onClick={() => setOpen(false)} className="ml-auto">
        <X />
        Close
      </Button>
    );
  }
}
