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
            <Button
              onClick={() => setOpen(true)}
              size="lg"
              className="rounded-full"
            >
              <ImageIcon />
              View Photo
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Where is this?</DrawerTitle>
              <DrawerDescription>
                Guess where this photo was taken from
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-2">
              <Image
                alt="Photo"
                height={768}
                preload
                src={`${SUPABASE_URL}${imagePath}`}
                width={768}
                className="rounded-md object-cover"
              />
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
            <Button
              onClick={() => setOpen(true)}
              size="lg"
              className="rounded-full"
            >
              <ImageIcon />
              View Photo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Where is this?</DialogTitle>
              <DialogDescription>
                Guess where this photo was taken from
              </DialogDescription>
            </DialogHeader>
            <Image
              alt="Photo"
              height={768}
              preload
              src={`${SUPABASE_URL}${imagePath}`}
              width={768}
              className="rounded-md object-cover"
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  onClick={() => setOpen(false)}
                  size="sm"
                  variant="outline"
                >
                  <X />
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
