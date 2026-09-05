import { db } from "@/lib/db";

export type UserStats = {
  gamesPlayed: number;
  currentStreak: number;
  maxStreak: number;
  averageScore: number;
  lastScore: number | null;
};

function getTorontoDateString(date = new Date()) {
  return Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
  }).format(date);
}

function addDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function computeStreaks(completedDates: string[], today: string) {
  if (completedDates.length === 0) {
    return { currentStreak: 0, maxStreak: 0 };
  }

  const completed = new Set(completedDates);
  let maxStreak = 0;
  let run = 0;
  let previous: string | null = null;

  for (const date of completedDates) {
    if (previous && date === addDays(previous, 1)) {
      run += 1;
    } else {
      run = 1;
    }
    maxStreak = Math.max(maxStreak, run);
    previous = date;
  }

  let currentStreak = 0;
  let cursor =
    completed.has(today) || completed.has(addDays(today, -1))
      ? completed.has(today)
        ? today
        : addDays(today, -1)
      : null;

  while (cursor && completed.has(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  return { currentStreak, maxStreak };
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const results = await db.query.roundResult.findMany({
    columns: {
      points: true,
    },
    where: {
      userId,
    },
    with: {
      round: {
        columns: {},
        with: {
          game: {
            columns: {
              date: true,
            },
          },
        },
      },
    },
  });

  const byDate = new Map<string, number[]>();

  for (const result of results) {
    const date = result.round?.game?.date;
    if (!date) continue;

    const scores = byDate.get(date) ?? [];
    scores.push(result.points);
    byDate.set(date, scores);
  }

  const completedGames = [...byDate.entries()]
    .filter(([, points]) => points.length >= 5)
    .map(([date, points]) => ({
      date,
      score: points.reduce((total, value) => total + value, 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const completedDates = completedGames.map((game) => game.date);
  const today = getTorontoDateString();
  const { currentStreak, maxStreak } = computeStreaks(completedDates, today);

  const totalScore = completedGames.reduce(
    (total, game) => total + game.score,
    0,
  );
  const gamesPlayed = completedGames.length;
  const lastScore =
    completedGames.length > 0
      ? completedGames[completedGames.length - 1].score
      : null;

  return {
    gamesPlayed,
    currentStreak,
    maxStreak,
    averageScore: gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0,
    lastScore,
  };
}
