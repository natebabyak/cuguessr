import { db } from "@/lib/db";

export type RankedEntry = {
  userId: string;
  rank: number;
  player: string;
  score: number;
  submittedAt: Date;
  isCurrentUser: boolean;
};

export type DailyLeaderboard = {
  gameId: number;
  rankedResults: RankedEntry[];
  playerCount: number;
  averageScore: number;
  topEntry: RankedEntry | null;
  yourBoardResult: RankedEntry | undefined;
};

export async function getDailyLeaderboard(
  date: string,
  currentUserId: string | null,
  isAnonymous: boolean,
): Promise<DailyLeaderboard | null> {
  const game = await db.query.game.findFirst({
    columns: {
      id: true,
    },
    where: {
      date,
    },
  });

  if (!game) {
    return null;
  }

  const roundResults = await db.query.roundResult.findMany({
    columns: {
      userId: true,
      points: true,
      createdAt: true,
    },
    where: {
      round: {
        gameId: game.id,
      },
      submittedBy: {
        isAnonymous: false,
      },
    },
    with: {
      submittedBy: {
        columns: {
          id: true,
          name: true,
          isAnonymous: true,
        },
      },
    },
  });

  const byUser = new Map<
    string,
    {
      name: string;
      points: number[];
      submittedAt: Date;
    }
  >();

  for (const result of roundResults) {
    if (!result.submittedBy || result.submittedBy.isAnonymous) {
      continue;
    }

    const existing = byUser.get(result.userId);
    if (existing) {
      existing.points.push(result.points);
      if (result.createdAt > existing.submittedAt) {
        existing.submittedAt = result.createdAt;
      }
    } else {
      byUser.set(result.userId, {
        name: result.submittedBy.name,
        points: [result.points],
        submittedAt: result.createdAt,
      });
    }
  }

  const completedGames = [...byUser.entries()]
    .filter(([, entry]) => entry.points.length >= 5)
    .map(([userId, entry]) => ({
      userId,
      player: entry.name,
      score: entry.points.reduce((total, value) => total + value, 0),
      submittedAt: entry.submittedAt,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.submittedAt.getTime() - b.submittedAt.getTime();
    });

  const rankedResults: RankedEntry[] = completedGames.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    isCurrentUser: !isAnonymous && currentUserId === entry.userId,
  }));

  const playerCount = rankedResults.length;
  const averageScore =
    playerCount > 0
      ? Math.round(
          rankedResults.reduce((total, entry) => total + entry.score, 0) /
            playerCount,
        )
      : 0;
  const topEntry = playerCount > 0 ? rankedResults[0] : null;
  const yourBoardResult =
    !isAnonymous && currentUserId
      ? rankedResults.find((entry) => entry.userId === currentUserId)
      : undefined;

  return {
    gameId: game.id,
    rankedResults,
    playerCount,
    averageScore,
    topEntry,
    yourBoardResult,
  };
}
