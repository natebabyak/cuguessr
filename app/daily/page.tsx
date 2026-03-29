import { createClient } from "@/lib/supabase/server";
import { Spinner } from "@/components/ui/spinner";
import { Game } from "@/components/game/game";
import { getOrCreateDailyChallenge } from "@/lib/daily-challenge";

export default async function Page() {
  const supabase = await createClient();

  const challenge = await getOrCreateDailyChallenge(
    new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }),
  );

  const { data: photos } = await supabase
    .from("photos")
    .select()
    .in("id", challenge.image_ids);

  if (!photos) return <Spinner />;

  const ordered = challenge.image_ids.map(
    (id: number) => photos.find((p) => p.id === id)!,
  );

  return (
    <div className="h-dvh w-dvw">
      <Game type="daily" photos={ordered} />
    </div>
  );
}
