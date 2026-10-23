import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Upload } from "lucide-react";

import { buttonVariants } from "#/components/ui/button";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="flex flex-col">
      <main>
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
      <footer></footer>
    </div>
  );
}
