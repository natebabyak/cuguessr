import { createClient } from "@/lib/supabase/server";
import { Game } from "./game";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function Page() {
  const supabase = await createClient();
  const { data: photos } = await supabase.from("photos").select();

  return (
    <main className="h-screen w-screen">
      {photos ? (
        <Game photos={photos} />
      ) : (
        <Empty className="">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Spinner />
            </EmptyMedia>
            <EmptyTitle>Loading the photos</EmptyTitle>
            <EmptyDescription className="text-balance">
              Please wait while we load the photos. Do not refresh the page.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </main>
  );
}
