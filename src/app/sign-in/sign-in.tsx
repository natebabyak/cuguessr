"use client";

import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";
import { ArrowLeftIcon, InboxIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import * as v from "valibot";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

const SignInSchema = v.object({
  email: v.pipe(v.string(), v.email("Please enter a valid email address.")),
});

export function SignIn() {
  const form = useForm({
    schema: SignInSchema,
    initialInput: {
      email: "",
    },
    validate: "submit",
    revalidate: "input",
  });

  const [step, setStep] = useState<"email" | "magic-link">("email");

  const handleSubmit: SubmitHandler<typeof SignInSchema> = async (output) => {
    const { error } = await authClient.signIn.magicLink({
      email: output.email,
      callbackURL: "/",
    });

    if (error) {
      toast.add({
        title: "Failed to send magic link",
        type: "error",
      });

      return;
    }

    setStep("magic-link");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center">
        <AnimatePresence initial={false} mode="wait">
          {step === "email" ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, scale: 0.99, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: 24 }}
              transition={{ duration: 0.5 }}
            >
              <Form of={form} onSubmit={handleSubmit}>
                <FieldGroup className="w-sm">
                  <FieldSet>
                    <FieldLegend>Welcome</FieldLegend>
                    <FieldDescription>
                      Sign in to save your stats
                    </FieldDescription>
                    <FieldGroup>
                      <Button
                        disabled={form.isSubmitting}
                        onClick={async () =>
                          await authClient.signIn.social({
                            provider: "discord",
                          })
                        }
                        type="button"
                        variant="outline"
                      >
                        <SiDiscord />
                        Continue with Discord
                      </Button>
                      <Button
                        disabled={form.isSubmitting}
                        onClick={async () =>
                          await authClient.signIn.social({
                            provider: "github",
                          })
                        }
                        type="button"
                        variant="outline"
                      >
                        <SiGithub />
                        Continue with GitHub
                      </Button>
                    </FieldGroup>
                    <FieldSeparator>or</FieldSeparator>
                    <FieldGroup>
                      <FormischField of={form} path={["email"]}>
                        {(field) => (
                          <>
                            <Field data-invalid={field.errors !== null}>
                              <FieldLabel htmlFor="sign-in-email">
                                Your Email
                              </FieldLabel>
                              <Input
                                aria-invalid={field.errors !== null}
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={form.isSubmitting}
                                id="sign-in-email"
                                placeholder="you@example.com"
                                {...field.props}
                              />
                              {field.errors && (
                                <FieldError
                                  errors={field.errors.map((message) => ({
                                    message,
                                  }))}
                                />
                              )}
                            </Field>
                            <Button
                              disabled={
                                field.errors !== null || form.isSubmitting
                              }
                              type="submit"
                            >
                              {form.isSubmitting && <Spinner />}
                              Continue with Email
                            </Button>
                          </>
                        )}
                      </FormischField>
                    </FieldGroup>
                  </FieldSet>
                </FieldGroup>
              </Form>
            </motion.div>
          ) : (
            <motion.div
              key="magic-link"
              initial={{ opacity: 0, scale: 0.99, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: 24 }}
              transition={{ duration: 0.5 }}
            >
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <InboxIcon />
                  </EmptyMedia>
                  <EmptyTitle className="text-2xl">Check your inbox</EmptyTitle>
                  <EmptyDescription>
                    We sent a link to your email. Click the link to sign in. If
                    you don't see it, check your spam folder.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => setStep("email")} variant="ghost">
                    <ArrowLeftIcon />
                    Return to sign in
                  </Button>
                </EmptyContent>
              </Empty>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
