import { useMemo } from "react";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { Item, ItemContent, ItemHeader } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function Page() {
  const today = Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
  }).format(new Date());

  const gameResults = await db.query.gameResult.findMany({
    columns: {
      points: true,
      createdAt: true,
    },
    where: {
      game: {
        date: today,
      },
    },
    orderBy: {
      points: "desc",
    },
    with: {
      submittedBy: {
        columns: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col">
      <AppHeader />
      <main className="flex flex-col items-center gap-4 p-4">
        <h1>cuGuessr</h1>
        <p>Played {gameResults.length} times</p>
        <Separator />
        <h2>Summary</h2>
        <Separator />
        <h2>Your Results</h2>
        <Item>
          <ItemContent></ItemContent>
        </Item>
        <div className="w-full max-w-md rounded-md border">
          <DataTable
            columns={columns}
            data={gameResults.map((result, index) => ({
              rank: index + 1,
              player: result.submittedBy?.name ?? "?",
              score: result.points,
              submittedAt: result.createdAt,
            }))}
          />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
