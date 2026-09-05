"use client";

import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import * as v from "valibot";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const SignInSchema = v.object({
  email: v.pipe(v.string(), v.email("Please enter a valid email address.")),
});

export default function Page() {
  const [screen, setScreen] = useState<"email" | "magicLink">("email");

  return (
    <div className="flex flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-sm">
        <AnimatePresence initial={false} mode="wait">
          {screen === "email" ? (
            <EmailScreen
              key="email"
              goToMagicLinkScreen={() => setScreen("magicLink")}
            />
          ) : (
            <MagicLinkScreen
              key="magicLink"
              goToEmailScreen={() => setScreen("email")}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function EmailScreen({
  goToMagicLinkScreen,
}: {
  goToMagicLinkScreen: () => void;
}) {
  const form = useForm({
    initialInput: {
      email: "",
    },
    schema: SignInSchema,
  });

  const handleSubmit: SubmitHandler<typeof SignInSchema> = async (output) => {
    await authClient.signIn.magicLink({
      email: output.email,
    });

    goToMagicLinkScreen();
  };

  return (
    <Form of={form} onSubmit={handleSubmit}>
      <FieldGroup>
        <FieldGroup>
          <Button
            disabled={form.isSubmitting}
            onClick={async () =>
              await authClient.signIn.social({
                provider: "discord",
              })
            }
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
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="sign-in-email">Your Email</FieldLabel>
                <Input
                  aria-invalid={field.errors !== null}
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  id="sign-in-email"
                  placeholder="Enter your email..."
                  {...field.props}
                />
                <FieldDescription>
                  Your email will not be shared with anyone.
                </FieldDescription>
                {field.errors && (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                  />
                )}
              </Field>
            )}
          </FormischField>
          <Button disabled={!form.isValid || form.isSubmitting} type="submit">
            {form.isSubmitting && <Spinner />}
            Continue with Email
          </Button>
        </FieldGroup>
      </FieldGroup>
    </Form>
  );
}

function MagicLinkScreen({ goToEmailScreen }: { goToEmailScreen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <h1 className="mt-8 text-center font-medium text-2xl">
        Check your email
      </h1>
      <p className="mt-2 text-balance text-center text-muted-foreground text-sm">
        We sent a temporary sign in link to your email. Please check your inbox
        and click the link to continue.
      </p>
      <div className="mt-8 flex flex-col gap-2">
        <Button>Enter code manually</Button>
        <Button onClick={goToEmailScreen} variant="ghost">
          Back to sign in
        </Button>
      </div>
    </motion.div>
  );
}
