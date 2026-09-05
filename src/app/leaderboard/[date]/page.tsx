import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { Item, ItemContent } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function Page({
  params,
}: {
  params: Promise<{
    date: string;
  }>;
}) {
  const { date } = await params;

  const roundResults = await db.query.roundResult.findMany({
    columns: {
      points: true,
      createdAt: true,
    },
    where: {
      round: {
        game: {
          date,
        },
      },
      submittedBy: {
        isAnonymous: false,
      },
    },
    orderBy: {
      points: "desc",
      createdAt: "asc",
    },
    with: {
      submittedBy: {
        columns: {
          name: true,
          isAnonymous: true,
        },
      },
    },
  });

  const rankedResults = roundResults.filter(
    (result) => !result.submittedBy?.isAnonymous,
  );

  return (
    <div className="flex flex-col">
      <AppHeader />
      <main className="flex flex-col items-center gap-4 p-4">
        <h1>cuGuessr</h1>
        <p>Played {rankedResults.length} times</p>
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
            data={rankedResults.map((result, index) => ({
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
