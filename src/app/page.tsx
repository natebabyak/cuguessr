import { ArrowRightIcon, PlayIcon, UploadIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import Topography from "@/components/Topography";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Footer } from "./footer";
import { Header } from "./header";

export default async function Page() {
  const today = Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
  }).format(new Date());

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

  return (
    <div className="relative h-screen w-screen">
      <Topography
        lowColor="#460809"
        midColor="#fb2c36"
        highColor="#fef2f2"
        speed={0.1}
        className="-z-50"
      />
      <div className="absolute top-0 left-0 -z-40 h-full w-full bg-radial from-20% from-background to-background/20"></div>
      <Header />
      <main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <section className="flex w-lg flex-col items-center justify-center gap-8">
          <h1 className="text-balance text-center font-medium text-3xl tracking-tighter md:text-5xl">
            How well do you know the Carleton campus?
          </h1>
          <p className="text-balance text-xl">
            280+ photos. 5 photos a day. See how you rank.
          </p>
          <div className="grid w-full max-w-xs gap-4">
            <Link href="/daily" className={buttonVariants({ size: "lg" })}>
              {roundsCompleted !== 5 && <PlayIcon />}
              {roundsCompleted === 0
                ? "Play Today's Game"
                : roundsCompleted === 5
                  ? "Today's Results"
                  : `Continue Today's Game (${roundsCompleted}/5)`}
              {roundsCompleted === 5 && <ArrowRightIcon />}
            </Link>
            <Link
              href="/daily"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <UploadIcon />
              Submit a Photo
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
