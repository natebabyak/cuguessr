"use client";

import {
  Form,
  Field as FormischField,
  reset,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { changeName } from "./actions";
import { NameSchema } from "./name-schema";

const TITLE = "Change Name";
const DESCRIPTION =
  "This is your public display name that will be shown to other players.";

export function NameDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    schema: NameSchema,
    initialInput: {
      name: "",
    },
  });

  const handleSubmit: SubmitHandler<typeof NameSchema> = async (output) => {
    setIsSubmitting(true);

    try {
      await toast.promise(changeName(output), {
        loading: "Submitting...",
        success: "Name changed successfully!",
        error: "Failed to change name.",
      });

      window.location.reload();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{TITLE}</DrawerTitle>
            <DrawerDescription>{DESCRIPTION}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <NameDialogForm />
          </div>
          <DrawerFooter>
            <NameDialogSubmit />
            <DrawerClose render={<NameDialogClose />} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{TITLE}</DialogTitle>
          <DialogDescription>{DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <NameDialogForm />
        <DialogFooter>
          <DialogClose render={<NameDialogClose />} />
          <NameDialogSubmit />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function NameDialogForm() {
    return (
      <Form id="change-name-form" of={form} onSubmit={handleSubmit}>
        <FieldGroup>
          <FormischField of={form} path={["name"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="new-name">New Name</FieldLabel>
                <Input
                  aria-invalid={field.errors !== null}
                  autoComplete="off"
                  id="new-name"
                  {...field.props}
                />
                {field.errors && (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                  />
                )}
              </Field>
            )}
          </FormischField>
        </FieldGroup>
      </Form>
    );
  }

  function NameDialogSubmit() {
    return (
      <Button
        disabled={!form.isValid || form.isSubmitting || isSubmitting}
        form="change-name-form"
        onClick={() => setIsSubmitting(true)}
        type="submit"
      >
        {form.isSubmitting ? <Spinner /> : <CheckIcon />}
        Done
      </Button>
    );
  }

  function NameDialogClose() {
    return (
      <Button
        onClick={() => {
          reset(form);
          onOpenChange(false);
        }}
        type="button"
        variant="outline"
      >
        <XIcon />
        Cancel
      </Button>
    );
  }
}
