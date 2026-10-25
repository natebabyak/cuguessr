import { createFileRoute, Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Play, Upload } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

import { Footer } from "#/components/footer";
import { Header } from "#/components/header";
import InfiniteSpiral from "#/components/InfiniteSpiral";
import { buttonVariants } from "#/components/ui/button";
import { getHomePhotosFn } from "#/lib/photos.functions";

export const Route = createFileRoute("/")({
  loader: async () => {
    const photos = await getHomePhotosFn();

    return { photos };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { photos } = Route.useLoaderData();

  const items = photos.map(({ objectKey }) => ({
    src: `${import.meta.env.VITE_CDN_URL}/cdn-cgi/image/width=200,quality=75,format=auto,fit=scale-down/photos/${objectKey}`,
    alt: objectKey,
  }));

  return (
    <Fragment>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="relative isolate flex flex-1 flex-col">
          <div aria-hidden="true" inert className="absolute inset-0 z-0">
            <InfiniteSpiral items={items} />
          </div>
          <section className="from-background absolute top-1/4 left-1/2 z-10 flex w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 bg-radial to-transparent to-70%">
            <h1 className="text-center text-4xl font-medium tracking-tighter text-balance">
              Put your Carleton knowledge on the map.
            </h1>
            <p className="text-center text-lg text-balance">
              Five campus photos. One daily challenge. Guess where each was taken and compete for
              the top spot on the leaderboard.
            </p>
            <Link
              to="/daily"
              className={cn(
                "w-xs",
                buttonVariants({
                  size: "lg",
                }),
              )}
            >
              <Play />
              Play Today's Game
            </Link>
            <Link
              to="/submit"
              className={cn(
                "w-xs",
                buttonVariants({
                  size: "lg",
                }),
              )}
            >
              <Upload />
              Submit a Photo
            </Link>
          </section>
        </main>
      </div>
      <Footer />
    </Fragment>
  );
}
