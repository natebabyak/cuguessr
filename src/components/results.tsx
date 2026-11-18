import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, FlameIcon, Share2Icon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { Button, buttonVariants } from "#/components/ui/button";
import { Item, ItemContent } from "#/components/ui/item";
import { toast } from "#/components/ui/toast";
import { authClient } from "#/lib/auth-client";
import { getGameNumber } from "#/lib/game";
import { getUserStreaksFn } from "#/lib/game-results.functions";

function getEmoji(points: number) {
  if (points >= 3750) return "🟩";
  if (points >= 2500) return "🟧";
  if (points >= 1250) return "🟨";
  return "🟥";
}

type UserStreaks = {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
};

export function Results({
  date,
  roundResults,
}: {
  date: string;
  roundResults: {
    roundId: number;
    distance: number;
    points: number;
  }[];
}) {
  const { data: session } = authClient.useSession();
  const [streaks, setStreaks] = useState<UserStreaks | null>(null);
  const isSignedIn = Boolean(session && !session.user.isAnonymous);
  const gameNumber = getGameNumber(date);
  const totalPoints = roundResults.reduce((acc, { points }) => acc + points, 0).toLocaleString();
  const emojis = roundResults.map(({ points }) => getEmoji(points)).join(" ");

  useEffect(() => {
    if (!isSignedIn) {
      setStreaks(null);
      return;
    }

    let cancelled = false;
    void getUserStreaksFn()
      .then((result) => {
        if (!cancelled) setStreaks(result);
      })
      .catch(() => {
        if (!cancelled) setStreaks(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  async function handleShareResults() {
    const shareText = [
      `cuGuessr #${gameNumber}`,
      date,
      "",
      `${totalPoints} points`,
      emojis,
      "",
      "https://www.cuguessr.com/daily",
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: `cuGuessr #${gameNumber} (${date})`,
          text: shareText,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.add({ title: "Copied to clipboard!" });
      } catch {
        toast.add({ title: "Something went wrong. Please try again." });
      }
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-center text-5xl font-semibold">
        <span className="text-primary">cu</span>
        Guessr #{gameNumber}
      </h1>
      <p className="text-muted-foreground text-lg">{date}</p>
      <p className="text-3xl font-medium">{totalPoints} points</p>
      {streaks && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full max-w-xs items-center justify-center gap-8"
          aria-label="Your streaks"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="text-primary flex items-center gap-1.5 text-2xl font-semibold tabular-nums">
              <FlameIcon aria-hidden="true" className="size-6" />
              <span>{streaks.currentStreak.toLocaleString()}</span>
            </div>
            <p className="text-muted-foreground text-sm">Current streak</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-2xl font-semibold tabular-nums">
              {streaks.bestStreak.toLocaleString()}
            </p>
            <p className="text-muted-foreground text-sm">Best streak</p>
          </div>
        </motion.div>
      )}
      <ul className="flex w-full max-w-xs flex-col gap-2">
        {roundResults.map((r, index) => (
          <motion.li
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 1) * 0.1 }}
            key={r.roundId}
          >
            <Item variant="outline" size="xs">
              <ItemContent>
                <label htmlFor={`round-${r.roundId}`} className="text-sm font-medium">
                  Round {index + 1}
                </label>
                <p className="text-muted-foreground text-sm">
                  {Math.round(r.distance).toLocaleString()} m · {r.points.toLocaleString()} pts.
                </p>
                <progress
                  id={`round-${r.roundId}`}
                  max={5000}
                  value={r.points}
                  className="accent-primary h-2 w-full"
                />
              </ItemContent>
            </Item>
          </motion.li>
        ))}
      </ul>
      <div className="grid w-full max-w-sm gap-4">
        <Button onClick={handleShareResults} size="lg">
          <Share2Icon />
          Share Results
        </Button>
        <Link
          to="/"
          className={buttonVariants({
            size: "lg",
            variant: "ghost",
          })}
        >
          <ArrowLeftIcon />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
