import { useState } from "react";

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

type ResponsiveModalProps = React.PropsWithChildren<{
  trigger: React.ReactElement;
  title: string;
  description: string;
  close: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

export function ResponsiveModal({
  trigger,
  title,
  description,
  close,
  children,
  open: controlledOpen,
  onOpenChange,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (value: boolean) => {
    setInternalOpen(value);
    onOpenChange?.(value);
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
        <DrawerTrigger render={trigger} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="m-4">{children}</div>
          <DrawerFooter>
            <DrawerClose render={close} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose render={close} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
