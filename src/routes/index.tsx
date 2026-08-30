import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRightIcon,
  CalendarIcon,
  PodiumIcon,
  UploadIcon,
} from "lucide-react";
import DriftWall from "#/components/DriftWall";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#/components/ui/accordion";
import { Button, buttonVariants } from "#/components/ui/button";
import { Calendar } from "#/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "#/components/ui/item";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import { getGalleryPhotos } from "#/lib/photo/functions";

const PHOTOS_URL = import.meta.env.VITE_PHOTOS_URL;

export const Route = createFileRoute("/")({
  loader: async () => {
    const photos = await getGalleryPhotos();

    return { photos };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { photos } = Route.useLoaderData();
  const galleryItems = photos.map((photo) => ({
    image: `${PHOTOS_URL}/${photo.objectKey}`,
    title: `Campus photo ${photo.id}`,
  }));

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 flex items-center justify-between bg-background/90 p-4 backdrop-blur-md">
        <Link to="/" className="font-semibold text-2xl">
          <span className="text-primary">cu</span>
          Guessr
        </Link>
        <div className="flex gap-2">
          <Link
            to="/sign-in"
            className={buttonVariants({ variant: "outline" })}
          >
            Sign In
          </Link>
          <Link to="/daily" className={buttonVariants()}>
            Play Today's Game
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger />
            <DropdownMenuContent></DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="[&>section]:flex [&>section]:flex-col [&>section]:items-center [&>section]:justify-center [&_h2]:font-medium [&_h2]:text-3xl">
        <section>
          <div className="h-150">
            <DriftWall
              items={galleryItems}
              columns={5}
              tileWidth={200}
              tileHeight={132}
              gap={18}
              tilt={16}
              turn={-14}
              perspective={1200}
              depth={120}
              speed={42}
              direction="up"
              variance={0.45}
              parallax={0.6}
              lift={64}
              fade={0.6}
              dim={0.55}
              overlayColor="#060010"
              radius={14}
              roll={0}
              pauseOnHover={false}
              grayscale={false}
            />
          </div>
          <h1 className="text-balance text-center font-medium text-5xl tracking-tighter">
            Test your knowledge of the Carleton campus
          </h1>
          <Link to="/daily" className={buttonVariants()}>
            Play Today's Game
          </Link>
          <Popover>
            <PopoverTrigger render={<Button size="icon" />}>
              <CalendarIcon />
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                captionLayout="dropdown"
                mode="single"
                timeZone="America/Toronto"
              />
            </PopoverContent>
          </Popover>
          <Link
            to="/leaderboard"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            <PodiumIcon />
            Leaderboard
          </Link>
          <Link
            to="/submit"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            <UploadIcon />
            Submit Photo
          </Link>
        </section>
        <section>
          <Item
            render={<Link to="/leaderboard" />}
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
        <section className="min-h-[50vh]">
          <h2>FAQ</h2>
          <Accordion className="w-full max-w-md">
            <AccordionItem>
              <AccordionTrigger>Can I submit a photo?</AccordionTrigger>
              <AccordionContent>
                Yes! Submit photos taken anywhere on Carleton&apos;s campus{" "}
                <Link to="/submit" className="underline underline-offset-4">
                  here
                </Link>
                . Every submission is reviewed before going live and can be
                removed at any time.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem>
              <AccordionTrigger>
                What do I do if I think an answer is incorrect?
              </AccordionTrigger>
              <AccordionContent>
                Hit the report button in the bottom right after making a guess.
                You can view the photo again before submitting to help explain
                the issue.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem>
              <AccordionTrigger>How do I contact the creator?</AccordionTrigger>
              <AccordionContent>
                Open a{" "}
                <a
                  href="https://github.com/natebabyak/cuguessr/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  GitHub Discussion
                </a>{" "}
                or{" "}
                <a
                  href="https://github.com/natebabyak/cuguessr/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  Issue
                </a>{" "}
                if you have a GitHub account, or reach out by{" "}
                <a
                  href="mailto:nate.babyak@outlook.com"
                  className="underline underline-offset-4"
                >
                  email
                </a>
                . Bug reports, suggestions, and feedback are always welcome.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
        <section className="primary">
          <Link to="/daily" className={buttonVariants()}>
            Play Today's Game
          </Link>
        </section>
      </main>
      <footer className="border-t">
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/daily">Daily</Link>
            </li>
            <li>
              <Link to="/leaderboard">Leaderboard</Link>
            </li>
            <li>
              <Link to="/submit">Submit</Link>
            </li>
          </ul>
        </nav>
        <p>&copy; 2025-2026 Nate Babyak</p>
        <a href="mailto:support@cuguessr.com" className={buttonVariants()}>
          Contact Support
        </a>
      </footer>
    </div>
  );
}
