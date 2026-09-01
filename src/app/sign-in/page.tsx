"use client";

import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import * as v from "valibot";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
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
    <div className="flex h-dvh w-full flex-col">
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Button
        disabled={form.isSubmitting}
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
        disabled={form.isSubmitting}
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
      <FieldSeparator>or</FieldSeparator>
      <Form of={form} onSubmit={handleSubmit}>
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
              {field.errors && (
                <FieldError
                  errors={field.errors.map((message) => ({ message }))}
                />
              )}
            </Field>
          )}
        </FormischField>
        <Button
          disabled={!form.isValid || form.isSubmitting}
          size="lg"
          type="submit"
        >
          {form.isSubmitting && <Spinner />}
          Continue with Email
        </Button>
      </Form>
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
