import {
  ArrowUpRightIcon,
  CalendarIcon,
  PlayIcon,
  PodiumIcon,
  UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import BlurText from "@/components/BlurText";
import DriftWall from "@/components/DriftWall";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { db } from "@/lib/db";

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
      <main className="[&>section]:flex [&>section]:min-h-[50vh] [&>section]:flex-col [&>section]:items-center [&>section]:justify-center [&>section]:gap-4 [&_h2]:font-medium [&_h2]:text-3xl">
        <section>
          <h1 className="text-balance text-center font-medium text-5xl tracking-tighter">
            How well do you know the Carleton campus?
          </h1>
          <p className="text-balance text-center text-muted-foreground">
            Guess the location of 250+ user-submitted photos of the Carleton
            campus.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/daily" className={buttonVariants()}>
              <PlayIcon />
              Play Today's Game ()
            </Link>
            <Popover>
              <PopoverTrigger>
                <Button>
                  <CalendarIcon />
                  Play Previous Games
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  captionLayout="dropdown"
                  mode="single"
                  timeZone="America/Toronto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </section>
        <section>
          <Item
            render={<Link href="/leaderboard" />}
            variant="outline"
            className="w-full max-w-xs"
          >
            <ItemMedia>
              <PodiumIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Leaderboard</ItemTitle>
              <ItemDescription>
                Compete with other players for the top spot
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <ArrowUpRightIcon className="size-5" />
            </ItemActions>
          </Item>
        </section>
        <section>
          <div className="h-screen w-full">
            <DriftWall items={driftWallItems} />
          </div>
        </section>
        <section>
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
