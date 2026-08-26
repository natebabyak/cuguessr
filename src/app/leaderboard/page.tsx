import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";

export default async function Page() {
  const users = await db.query.user.findMany({
    with: {
      gameResults: true,
    },
  });

  return (
    <Tabs>
      <TabsList>
        <TabsTrigger value="bestScore">Best Score</TabsTrigger>
        <TabsTrigger value="mostPhotosSubmitted">
          Most Photos Submitted
        </TabsTrigger>
        <TabsTrigger value="currentStreak">Current Streak</TabsTrigger>
        <TabsTrigger value="longestStreak">Longest Streak</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
