import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, Share2Icon } from "lucide-react";
import { motion } from "motion/react";

import { Button, buttonVariants } from "#/components/ui/button";
import { Item, ItemContent } from "#/components/ui/item";
import { toast } from "#/components/ui/toast";
import { getGameNumber } from "#/lib/game";

function getEmoji(points: number) {
  if (points >= 3750) return "🟩";
  if (points >= 2500) return "🟧";
  if (points >= 1250) return "🟨";
  return "🟥";
}

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
  const gameNumber = getGameNumber(date);
  const totalPoints = roundResults.reduce((acc, { points }) => acc + points, 0).toLocaleString();
  const emojis = roundResults.map(({ points }) => getEmoji(points)).join(" ");

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
