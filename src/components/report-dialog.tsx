import { useForm } from "@tanstack/react-form";
import { FlagIcon, SendIcon, XIcon } from "lucide-react";
import { useState } from "react";
import z from "zod";
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
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "#/components/ui/input-group";
import { Spinner } from "#/components/ui/spinner";
import { useIsMobile } from "#/hooks/use-mobile";
import { cn } from "#/lib/utils";
import { Button } from "./ui/button";

const TITLE = "Submit Report";
const DESCRIPTION = "Enter a description to submit a report.";

const reportSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required.")
    .max(255, "Description must be at most 255 characters."),
});

export function ReportDialog({ photoId }: { photoId: number }) {
  const isMobile = useIsMobile();

  const form = useForm({
    defaultValues: {
      description: "",
    },
    validators: {
      onSubmit: reportSchema,
    },
    onSubmit: async ({ value }) => {
      const { description } = value;
      console.log(description);
    },
  });

  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger render={<ReportDialogTrigger />} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{TITLE}</DrawerTitle>
            <DrawerDescription>{DESCRIPTION}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <SubmitDialogForm />
          </div>
          <DrawerFooter>
            <ReportDialogSubmit />
            <DrawerClose render={<ReportDialogClose />} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<ReportDialogTrigger />} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{TITLE}</DialogTitle>
          <DialogDescription>{DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <SubmitDialogForm />
        <DialogFooter>
          <DialogClose render={<ReportDialogClose />} />
          <ReportDialogSubmit />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function ReportDialogTrigger() {
    return (
      <Button
        onClick={() => setOpen(true)}
        size="icon-lg"
        title="Report photo"
        className="shadow"
      >
        <FlagIcon />
      </Button>
    );
  }

  function SubmitDialogForm() {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="description">
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor="report-description">
                  Description
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    aria-invalid={field.state.meta.errors.length > 0}
                    autoCapitalize="sentences"
                    autoFocus
                    id="report-description"
                    onInput={(e) =>
                      field.handleChange(
                        (e.target as HTMLTextAreaElement).value,
                      )
                    }
                    placeholder="Enter a description..."
                    value={field.state.value}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText
                      className={cn(
                        field.state.value.length > 255 && "text-destructive",
                      )}
                    >
                      {field.state.value.length}/255
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </form>
    );
  }

  function ReportDialogSubmit() {
    return (
      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? <Spinner /> : <SendIcon />}
            Submit
          </Button>
        )}
      </form.Subscribe>
    );
  }

  function ReportDialogClose() {
    return (
      <Button onClick={() => setOpen(false)} type="button" variant="outline">
        <XIcon />
        Cancel
      </Button>
    );
  }
}
