import { notFound } from "next/navigation";
import * as v from "valibot";
import { db } from "@/lib/db";
import { Game } from "./game";

const ParamsSchema = v.object({
  date: v.pipe(v.string(), v.regex(v.ISO_DATE_REGEX)),
});

export default async function Page({
  params,
}: {
  params: Promise<{
    date: string;
  }>;
}) {
  const result = v.safeParse(ParamsSchema, await params);

  if (!result.success) notFound();

  const game = await db.query.game.findFirst({
    columns: {
      id: true,
    },
    where: {
      date: result.output.date,
    },
  });

  if (!game) notFound();

  return <Game gameId={game.id} />;
}
