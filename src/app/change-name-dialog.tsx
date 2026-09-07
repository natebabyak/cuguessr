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
  DrawerTrigger,
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

export function ChangeNameDialog() {
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);

  const form = useForm({
    schema: NameSchema,
    initialInput: {
      name: "",
    },
  });

  const handleSubmit: SubmitHandler<typeof NameSchema> = async (output) => {
    await toast.promise(changeName(output), {
      loading: "Loading...",
      success: "Name changed successfully!",
      error: "Failed to change name.",
    });
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger render={<ChangeNameDialogTrigger />} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{TITLE}</DrawerTitle>
            <DrawerDescription>{DESCRIPTION}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <ChangeNameDialogForm />
          </div>
          <DrawerFooter>
            <ChangeNameDialogSubmit />
            <DrawerClose render={<ChangeNameDialogClose />} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={<ChangeNameDialogTrigger />} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{TITLE}</DialogTitle>
          <DialogDescription>{DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <ChangeNameDialogForm />
        <DialogFooter>
          <DialogClose render={<ChangeNameDialogClose />} />
          <ChangeNameDialogSubmit />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function ChangeNameDialogTrigger() {
    return <Button onClick={() => setOpen(true)}>Change Name</Button>;
  }

  function ChangeNameDialogForm() {
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

  function ChangeNameDialogSubmit() {
    return (
      <Button
        disabled={!form.isValid || form.isSubmitting}
        form="change-name-form"
        type="submit"
      >
        {form.isSubmitting ? <Spinner /> : <CheckIcon />}
        Done
      </Button>
    );
  }

  function ChangeNameDialogClose() {
    return (
      <Button
        onClick={() => {
          reset(form);
          setOpen(false);
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
