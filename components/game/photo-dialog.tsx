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
import { useEffect, useState } from "react";

const TITLE_CONTENT = "Where is this?";
const DESCRIPTION_CONTENT = "Guess where this photo was taken from";
const SUPABASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/`;

interface PhotoDialogProps {
  imagePath: string;
}

export function PhotoDialog({ imagePath }: PhotoDialogProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = `${SUPABASE_URL}${imagePath}`;
    img.onload = () => {
      setImageLoaded(true);
      setOpen(true);
    };
  }, [imagePath]);

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
      <Button
        disabled={!imageLoaded}
        onClick={() => setOpen(true)}
        size="lg"
        className="rounded-full"
      >
        <ImageIcon />
        View Photo
      </Button>
    );
  }

  function Photo() {
    return (
      <Image
        alt="Photo"
        height={768}
        priority
        src={`${SUPABASE_URL}${imagePath}`}
        width={768}
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
