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
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const TITLE_CONTENT = "Where is this?";
const DESCRIPTION_CONTENT = "Guess where this photo was taken from";
const SUPABASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/`;

interface PhotoDialogProps {
  imagePath: string;
}

export function PhotoDialog({ imagePath }: PhotoDialogProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(true);

  return (
    <div className="pointer-events-auto self-end justify-self-start">
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
              <DialogDescription>{DESCRIPTION_CONTENT}</DialogDescription>
            </DialogHeader>
            <Photo />
            <DialogFooter>
              <DialogClose asChild>
                <CloseButton />
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
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
      <Image
        src={`${SUPABASE_URL}${imagePath}`}
        alt="Photo"
        width={768}
        height={768}
        preload
        className="rounded-md object-cover"
      />
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
