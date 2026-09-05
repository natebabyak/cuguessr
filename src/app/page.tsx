import { LogInIcon, PlayIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { AppFooter } from "@/components/app-footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Page() {
  const today = Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
  }).format(new Date());

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isSignedIn = Boolean(session && !session.user.isAnonymous);

  const todayRoundCount = session
    ? (
        await db.query.roundResult.findMany({
          columns: {
            roundId: true,
          },
          where: {
            AND: [
              {
                userId: session.user.id,
              },
              {
                round: {
                  game: {
                    date: today,
                  },
                },
              },
            ],
          },
        })
      ).length
    : 0;

  const dailyCta =
    todayRoundCount >= 5
      ? { label: "View Results" }
      : todayRoundCount > 0
        ? { label: `Continue Today's Game (${todayRoundCount}/5)` }
        : { label: "Play Today's Game" };

  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1">
        <section className="flex flex-col items-center px-4 py-16 md:py-24">
          <div className="flex max-w-2xl flex-col items-center gap-6 text-center">
            <h1 className="font-semibold text-4xl tracking-tight md:text-5xl">
              <span className="text-primary">cu</span>
              Guessr
            </h1>
            <p className="text-balance font-medium text-2xl tracking-tight md:text-3xl">
              How well do you know campus?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/daily" className={buttonVariants({ size: "lg" })}>
                <PlayIcon />
                {dailyCta.label}
              </Link>
              {!isSignedIn ? (
                <Link
                  href="/sign-in"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  <LogInIcon />
                  Sign in
                </Link>
              ) : null}
            </div>
            <p className="text-balance text-base text-muted-foreground md:text-lg">
              Five photos a day. See how you rank.
            </p>
          </div>
        </section>
        <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-16 md:py-24 [&_h2]:font-medium [&_h2]:text-3xl">
          <h2>FAQ</h2>
          <Accordion className="w-full max-w-xl">
            <AccordionItem>
              <AccordionTrigger>
                What do I do if an answer is wrong?
              </AccordionTrigger>
              <AccordionContent>
                Press the report button in the bottom left corner after
                submitting a guess.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem>
              <AccordionTrigger>Do I need an account?</AccordionTrigger>
              <AccordionContent>
                No — you can play without one. Sign in to appear on the
                leaderboard and keep your streak.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
