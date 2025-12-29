import { createClient } from "@/lib/supabase/server";
import { Game } from "./game";
import { Spinner } from "@/components/ui/spinner";

export default async function Page() {
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("photos")
    .select()
    .eq("verified", true);

  if (!photos) return;

  return (
    <main className="h-screen w-screen">
      {photos ? <Game photos={photos} /> : <Spinner />}
    </main>
  );
}
