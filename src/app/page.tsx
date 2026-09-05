import { PlayIcon, PodiumIcon, UploadIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import AccordionGallery from "@/components/AccordionGallery";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
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

  const photos = await db.query.photo.findMany({
    columns: {
      objectKey: true,
      createdAt: true,
    },
    where: {
      status: "approved",
    },
    orderBy: {
      createdAt: "desc",
    },
    limit: 5,
    with: {
      submittedBy: {
        columns: {
          name: true,
        },
      },
    },
  });

  const accordionGalleryItems = photos.map((photo) => ({
    image: `${process.env.NEXT_PUBLIC_R2_URL}/photos/${photo.objectKey}`,
    label: `Submitted ${photo.createdAt.toLocaleDateString()}${photo.submittedBy?.name ? ` by ${photo.submittedBy.name}` : ""}`,
  }));

  return (
    <div className="flex flex-col">
      <AppHeader />
      <main className="[&_h2]:font-medium [&_h2]:text-3xl [&_p]:text-balance [&_p]:text-lg [&_p]:text-muted-foreground">
        <section className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-linear-to-b from-border/25">
          <h1 className="text-balance text-center font-medium text-3xl tracking-tighter md:text-5xl">
            How well do you know the Carleton campus?
          </h1>
          <p>280+ photos. 5 photos per day. See how you rank against others.</p>
          <div className="grid w-sm gap-4">
            <Link href="/daily" className={buttonVariants()}>
              <PlayIcon />
              {dailyCta.label}
            </Link>
            <Link
              href="/leaderboard"
              className={buttonVariants({ variant: "outline" })}
            >
              <PodiumIcon />
              Today's Leaderboard
            </Link>
          </div>
        </section>
        <section className="flex flex-col items-center justify-center gap-4 py-8">
          <h2>Featured Photos</h2>
          <p>
            Contribute your own photos to the collection of 280+ user-submitted
            photos.
          </p>
          <Link
            href="/submit"
            className={buttonVariants({ className: "w-sm" })}
          >
            <UploadIcon />
            Submit a Photo
          </Link>
          <AccordionGallery items={accordionGalleryItems} />
        </section>
        <section className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <h2>FAQ</h2>
          <Accordion className="w-full max-w-md">
            <AccordionItem>
              <AccordionTrigger>Can I submit a photo?</AccordionTrigger>
              <AccordionContent>
                Probably! As long as it's taken on or around Carleton's campus
                and reasonably possible, you can submit it. Challenging photos
                are encouraged!
              </AccordionContent>
            </AccordionItem>
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
                No, but it's the only way your streak and leaderboard spot are
                saved!
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
