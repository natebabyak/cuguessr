import { ArrowRightIcon, PlayIcon, UploadIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import DriftWall from "@/components/DriftWall";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Page() {
  const today = Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
  }).format(new Date());

  const photos = await db.query.photo.findMany({
    columns: {
      objectKey: true,
      width: true,
      createdAt: true,
    },
    where: {
      status: "approved",
    },
    orderBy: {
      updatedAt: "desc",
    },
    limit: 15,
    with: {
      submittedBy: {
        columns: {
          name: true,
        },
      },
    },
  });

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const roundsCompleted = session
    ? (
        await db.query.roundResult.findMany({
          columns: {
            createdAt: true,
          },
          where: {
            userId: session.user.id,
            round: {
              game: {
                date: today,
              },
            },
          },
        })
      ).length
    : 0;

  const items = photos.map((photo) => ({
    image: `${process.env.NEXT_PUBLIC_CDN_URL}/cdn-cgi/image/width=200,quality=50,format=auto/photos/${photo.objectKey}`,
  }));

  return (
    <div className="flex flex-col">
      <div className="flex h-screen flex-col">
        <Header />
        <div className="relative flex-1 overflow-hidden">
          <DriftWall items={items} className="-z-50 lg:translate-x-110" />
          <div className="absolute inset-0 -z-40 bg-radial from-25% from-background to-75% to-transparent lg:hidden"></div>
          <div className="absolute inset-0 mx-auto max-w-5xl px-4">
            <main className="absolute top-1/2 left-1/2 flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-8 lg:left-0 lg:translate-x-0 lg:items-start">
              <h1 className="flex flex-col text-balance text-center font-medium text-5xl tracking-tighter lg:text-start">
                How well do you know the Carleton campus?
              </h1>
              <p className="text-xl lg:text-start">
                280+ photos. 5 photos a day. See how you rank.
              </p>
              <div className="grid w-full max-w-xs gap-4">
                <Link
                  href="/daily"
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "slide-in-from-bottom-20 zoom-in-90 fade-in-0 h-13 animate-in fill-mode-backwards delay-250 duration-500 ease-in-out",
                  })}
                >
                  {roundsCompleted !== 5 && <PlayIcon />}
                  {roundsCompleted === 0
                    ? "Play Today's Game"
                    : roundsCompleted === 5
                      ? "Today's Results"
                      : `Continue Today's Game (${roundsCompleted}/5)`}
                  {roundsCompleted === 5 && <ArrowRightIcon />}
                </Link>
                <Link
                  href="/submit"
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "slide-in-from-bottom-20 zoom-in-90 fade-in-0 h-13 animate-in bg-secondary-foreground fill-mode-backwards text-secondary delay-750 duration-500 ease-in-out hover:bg-secondary-foreground/80",
                  })}
                >
                  <UploadIcon />
                  Submit a Photo
                </Link>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
