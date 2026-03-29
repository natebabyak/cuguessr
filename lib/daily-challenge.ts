import { createClient } from "@/lib/supabase/server";

const DAILY_IMAGE_COUNT = 5;
const LOOKBACK_DAYS = 7;

function todayEST(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

function shiftDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day + days);
  return d.toLocaleDateString("en-CA");
}

export async function getOrCreateDailyChallenge(dateStr: string) {
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("daily_challenges")
    .select("*")
    .eq("game_date", dateStr)
    .maybeSingle();

  if (fetchError)
    throw new Error(`Failed to fetch daily challenge: ${fetchError.message}`);
  if (existing) return existing;

  const lookbackDate = shiftDateString(dateStr, -LOOKBACK_DAYS);

  const { data: recentChallenges, error: recentError } = await supabase
    .from("daily_challenges")
    .select("image_ids")
    .gte("game_date", lookbackDate)
    .lt("game_date", dateStr);

  if (recentError)
    throw new Error(
      `Failed to fetch recent challenges: ${recentError.message}`,
    );

  const usedImageIds: number[] =
    recentChallenges?.flatMap((c) => c.image_ids) ?? [];

  const { data: candidates, error: imagesError } =
    usedImageIds.length > 0
      ? await supabase
          .from("photos")
          .select("id")
          .eq("verified", true)
          .not("id", "in", `(${usedImageIds.join(",")})`)
      : await supabase.from("photos").select("id").eq("verified", true);

  if (imagesError)
    throw new Error(`Failed to fetch images: ${imagesError.message}`);
  if (!candidates || candidates.length < DAILY_IMAGE_COUNT) {
    throw new Error(
      `Not enough eligible images. Found ${candidates?.length ?? 0}, need ${DAILY_IMAGE_COUNT}.`,
    );
  }

  const selectedIds: number[] = candidates
    .sort(() => Math.random() - 0.5)
    .slice(0, DAILY_IMAGE_COUNT)
    .map((img) => img.id);

  const { data: newChallenge, error: insertError } = await supabase
    .from("daily_challenges")
    .upsert(
      { game_date: dateStr, image_ids: selectedIds },
      { onConflict: "game_date", ignoreDuplicates: true },
    )
    .select()
    .maybeSingle();

  if (insertError)
    throw new Error(`Failed to create daily challenge: ${insertError.message}`);

  if (!newChallenge) {
    const { data: raceWinner, error } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("game_date", dateStr)
      .single();

    if (error) throw new Error(`Failed to fetch race winner: ${error.message}`);
    return raceWinner;
  }

  return newChallenge;
}

export async function getTodaysDailyChallenge() {
  const today = todayEST();
  const tomorrow = shiftDateString(today, 1);

  getOrCreateDailyChallenge(tomorrow).catch((err) =>
    console.warn("Pre-generation for tomorrow failed (non-fatal):", err),
  );

  return getOrCreateDailyChallenge(today);
}
