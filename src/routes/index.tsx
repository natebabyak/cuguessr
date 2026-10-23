import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Upload } from "lucide-react";

import CircularCarousel from "#/components/CircularCarousel";
import { Footer } from "#/components/footer";
import { Header } from "#/components/header";
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
    src: `${import.meta.env.VITE_CDN_URL}/cdn-cgi/image/width=220,quality=75,format=auto,fit=scale-down/photos/${objectKey}`,
  }));

  return (
    <div className="flex flex-col">
      <Header />
      <main>
        <div className="h-[500px] w-full">
          <CircularCarousel items={items} preset="cylinder" intro="rise" />
        </div>
        <section>
          <h1>cuGuessr</h1>
          <p>Put your knowledge of the Carleton campus to the test</p>
          <div className="flex flex-col gap-4">
            <Link to="/daily" className={buttonVariants({ size: "lg" })}>
              <Play />
              Play Today's Game
            </Link>
            <Link to="/submit" className={buttonVariants({ size: "lg" })}>
              <Upload />
              Submit a Photo
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
