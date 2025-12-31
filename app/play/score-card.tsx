import { Card, CardContent } from "@/components/ui/card";

interface ScoreCardProps {
  round: number;
  score: number;
}

export function ScoreCard({ round, score }: ScoreCardProps) {
  return (
    <Card className="absolute top-2 right-2 md:right-4 md:top-4 z-10">
      <CardContent className="flex gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-medium">Round</span>
          <div className="flex items-end ml-auto">
            <span className="text-xl font-semibold">{round}</span>
            <span className="text-muted-foreground text-xs">/5</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-lg font-medium">Score</span>
          <div className="flex items-end ml-auto">
            <span className="text-xl font-semibold">
              {score.toLocaleString("en-US")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
