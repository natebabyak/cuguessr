import { createClient } from "@/lib/supabase/server";
import { Spinner } from "@/components/ui/spinner";
import { Game } from "@/components/game/game";
import { pickRandom } from "@/lib/utils";

export default async function Page() {
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("photos")
    .select()
    .eq("verified", true);

  if (!photos) return <Spinner />;

  return (
    <div className="h-dvh w-dvw">
      <Game
        type="daily"
        photos={pickRandom(photos, 5, new Date().toDateString())}
      />
    </div>
  );
}
