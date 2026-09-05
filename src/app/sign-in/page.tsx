"use client";

import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";
import { ArrowLeftIcon, LogOutIcon, PenIcon, PlayIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as v from "valibot";
import { getMyStats } from "@/app/actions";
import { NameDialog } from "@/app/name-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
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
import type { UserStats } from "@/lib/stats";

const SignInSchema = v.object({
  email: v.pipe(v.string(), v.email("Please enter a valid email address.")),
});

function getCallbackURL() {
  if (typeof window === "undefined") {
    return "/daily";
  }

  try {
    const referrer = document.referrer;
    if (referrer) {
      const url = new URL(referrer);
      if (url.origin === window.location.origin) {
        return `${url.pathname}${url.search}`;
      }
    }
  } catch {}

  return "/daily";
}

export default function Page() {
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session && !session.user.isAnonymous);

  const form = useForm({
    initialInput: {
      email: "",
    },
    schema: SignInSchema,
  });

  const [screen, setScreen] = useState<"email" | "magicLink">("email");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setStats(null);
      return;
    }

    let cancelled = false;

    void getMyStats().then((nextStats) => {
      if (!cancelled) {
        setStats(nextStats);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  const handleSubmit: SubmitHandler<typeof SignInSchema> = async (output) => {
    await authClient.signIn.magicLink({
      email: output.email,
      callbackURL: getCallbackURL(),
    });

    setScreen("magicLink");
  };

  if (!isPending && isSignedIn && session) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-2 text-center">
          <h1 className="font-semibold text-2xl">Account</h1>
          <p className="text-muted-foreground text-sm">
            Signed in as {session.user.name}
          </p>
          {stats ? (
            <p className="text-muted-foreground text-sm">
              {stats.currentStreak}-day streak · {stats.gamesPlayed}{" "}
              {stats.gamesPlayed === 1 ? "game" : "games"} played
            </p>
          ) : null}
        </div>
        <div className="grid w-full max-w-sm gap-3">
          <Button
            onClick={() => setNameDialogOpen(true)}
            size="lg"
            variant="outline"
          >
            <PenIcon />
            Change Name
          </Button>
          <Link href="/daily" className={buttonVariants({ size: "lg" })}>
            <PlayIcon />
            Play Today&apos;s Game
          </Link>
          <Button
            onClick={async () => await authClient.signOut()}
            size="lg"
            variant="outline"
          >
            <LogOutIcon />
            Sign out
          </Button>
          <Link
            href="/"
            className={buttonVariants({ size: "lg", variant: "ghost" })}
          >
            <ArrowLeftIcon />
            Back to Home
          </Link>
        </div>
        <NameDialog open={nameDialogOpen} onOpenChange={setNameDialogOpen} />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <AnimatePresence initial={false} mode="wait">
        {screen === "email" ? (
          <Form of={form} onSubmit={handleSubmit}>
            <FieldGroup className="w-sm">
              <div className="mb-2 text-center">
                <h1 className="font-semibold text-2xl">Sign in</h1>
                <p className="mt-1 text-muted-foreground text-sm">
                  Save your streak and appear on the leaderboard
                </p>
              </div>
              <FieldGroup>
                <Button
                  disabled={form.isSubmitting}
                  onClick={async () =>
                    await authClient.signIn.social({
                      provider: "discord",
                      callbackURL: getCallbackURL(),
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
                      callbackURL: getCallbackURL(),
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
                      <FieldLabel htmlFor="sign-in-email">
                        Your Email
                      </FieldLabel>
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
                        Your email will not be visible to others
                      </FieldDescription>
                      {field.errors && (
                        <FieldError
                          errors={field.errors.map((message) => ({
                            message,
                          }))}
                        />
                      )}
                    </Field>
                  )}
                </FormischField>
                <Button
                  disabled={!form.isValid || form.isSubmitting}
                  type="submit"
                >
                  {form.isSubmitting && <Spinner />}
                  Continue with Email
                </Button>
              </FieldGroup>
              <Link
                href="/"
                className={buttonVariants({
                  variant: "ghost",
                  className: "w-full",
                })}
              >
                <ArrowLeftIcon />
                Back to Home
              </Link>
            </FieldGroup>
          </Form>
        ) : (
          <div className="flex w-sm flex-col items-center gap-4">
            <h1 className="mt-8 text-center font-medium text-2xl">
              Check your email
            </h1>
            <p className="mt-2 text-balance text-center text-muted-foreground text-sm">
              We sent a temporary sign in link to your email. Please check your
              inbox and click the link to continue.
            </p>
            <Button onClick={() => setScreen("email")} variant="outline">
              <ArrowLeftIcon />
              Back to sign in
            </Button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
