import { PlayIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import AccordionGallery from "@/components/AccordionGallery";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import CountUp from "@/components/CountUp";
import DriftWall from "@/components/DriftWall";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/lib/db";
import { PlayPreviousGames } from "./play-previous-games";

export default async function Page() {
  const photos = await db.query.photo.findMany({
    columns: {
      objectKey: true,
    },
    where: {
      status: "approved",
    },
    orderBy: {
      createdAt: "desc",
    },
    limit: 15,
  });

  const driftWallItems = photos.map((photo) => ({
    image: `${process.env.NEXT_PUBLIC_R2_URL}/photos/${photo.objectKey}`,
  }));

  return (
    <div className="flex flex-col">
      <AppHeader />
      <main className="[&_h2]:font-medium [&_h2]:text-3xl [&_p]:text-lg [&_p]:text-muted-foreground">
        <section className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <h1 className="text-balance text-center font-medium text-5xl tracking-tighter">
            How well do you know the Carleton campus?
          </h1>
          <p>
            Guess the location of 250+ user-submitted photos of the Carleton
            campus.
          </p>
          <div className="grid w-sm gap-2">
            <Link href="/daily" className={buttonVariants()}>
              <PlayIcon />
              Play Today's Game
            </Link>
            <PlayPreviousGames />
          </div>
        </section>
        <section className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <AccordionGallery items={driftWallItems.slice(0, 5)} />
        </section>
        <section className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <h2>
            <CountUp from={0} to={280} />+ User-Submitted Photos
          </h2>
          <p>
            cuGuessr is powered by the Carleton community and every photo
            submitted makes the game better.
          </p>
          <Link
            href="/submit"
            className={buttonVariants({ className: "w-sm" })}
          >
            <UploadIcon />
            Submit a Photo
          </Link>
          <div className="h-150 w-full">
            <DriftWall items={driftWallItems} className="cursor-none" />
          </div>
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
              <AccordionTrigger>Do I need to sign in to play?</AccordionTrigger>
              <AccordionContent>
                No. However, you will need to sign in to appear on the
                leaderboard or be credited for submitted photos. When you create
                an account, your stats will be saved.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem>
              <AccordionTrigger>Can I make a suggestion?</AccordionTrigger>
              <AccordionContent></AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
