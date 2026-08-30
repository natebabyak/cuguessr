"use client";

import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import * as v from "valibot";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const SignInSchema = v.object({
  email: v.pipe(v.string(), v.email("Please enter a valid email address.")),
});

export default function Page() {
  const [screen, setScreen] = useState<"email" | "magicLink">("email");

  return (
    <div className="flex h-dvh w-full flex-col bg-linear-to-b from-muted/25 to-transparent">
      <header className="p-4 md:p-8">
        <Link href="/" className="flex items-center font-semibold text-2xl">
          <span className="text-red-500">cu</span>
          Guessr
        </Link>
      </header>
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
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      const { email } = value;

      await authClient.signIn.magicLink({
        email,
      });

      goToMagicLinkScreen();
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
      >
        <FieldSet>
          <FieldLegend>Sign in to cuGuessr</FieldLegend>
          <FieldDescription>
            Track your stats and see how you compare to others
          </FieldDescription>
          <form.Subscribe
            selector={(state) => ({
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ isSubmitting }) => (
              <>
                <Button
                  disabled={isSubmitting}
                  onClick={async () =>
                    await authClient.signIn.social({
                      provider: "discord",
                    })
                  }
                  size="lg"
                  type="button"
                  variant="outline"
                  className="hover:border-primary"
                >
                  <SiDiscord />
                  Continue with Discord
                </Button>
                <Button
                  disabled={isSubmitting}
                  onClick={async () =>
                    await authClient.signIn.social({
                      provider: "github",
                    })
                  }
                  size="lg"
                  type="button"
                  variant="outline"
                  className="hover:border-primary"
                >
                  <SiGithub />
                  Continue with GitHub
                </Button>
              </>
            )}
          </form.Subscribe>
          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            or
            <Separator className="flex-1" />
          </div>
          <FieldGroup>
            <form.Field name="email">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor="sign-in-email">Your Email</FieldLabel>
                  <Input
                    aria-invalid={field.state.meta.errors.length > 0}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    id="sign-in-email"
                    onBlur={field.handleBlur}
                    onInput={(e) =>
                      field.handleChange((e.target as HTMLInputElement).value)
                    }
                    placeholder="Enter your email..."
                    value={field.state.value}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {field.state.meta.errors[0]?.message}
                    </FieldError>
                  )}
                </Field>
              )}
            </form.Field>
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button
                  disabled={!canSubmit || isSubmitting}
                  size="lg"
                  type="submit"
                >
                  {isSubmitting && <Spinner />}
                  Continue with Email
                </Button>
              )}
            </form.Subscribe>
            <Button onClick={goToMagicLinkScreen}>temp</Button>
          </FieldGroup>
        </FieldSet>
      </form>
    </motion.div>
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
        <Button onClick={goToEmailScreen} size="lg" variant="ghost">
          Back to sign in
        </Button>
      </div>
    </motion.div>
  );
}
