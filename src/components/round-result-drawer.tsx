import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid } from "recharts";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "#/components/ui/drawer";
import { roundResultsByRoundIdQueryOptions } from "#/lib/round-result/queries";
import CountUp from "./CountUp";
import { Button } from "./ui/button";
import { type ChartConfig, ChartContainer } from "./ui/chart";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";

const chartConfig = {
  count: {
    label: "Count",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function RoundResultDrawer({
  open,
  onOpenChange,
  roundId,
  distance,
  points,
  totalPoints,
  isLastRound,
  onNext,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roundId: number;
  distance: number;
  points: number;
  totalPoints: number;
  isLastRound: boolean;
  onNext: () => void;
}) {
  const { data: roundResults } = useQuery(
    roundResultsByRoundIdQueryOptions(roundId),
  );

  const chartData = useMemo(() => {
    const histogram = [
      { value: "0-500", count: 0 },
      { value: "500-1000", count: 0 },
      { value: "1000-1500", count: 0 },
      { value: "1500-2000", count: 0 },
      { value: "2000-2500", count: 0 },
      { value: "2500-3000", count: 0 },
      { value: "3000-3500", count: 0 },
      { value: "3500-4000", count: 0 },
      { value: "4000-4500", count: 0 },
      { value: "4500-5000", count: 0 },
    ];

    for (const roundResult of roundResults ?? []) {
      const index = Math.floor(roundResult.points / 500);
      histogram[index].count++;
    }

    return histogram;
  }, [roundResults]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Round Results</DrawerTitle>
        </DrawerHeader>
        <Item>
          <ItemContent>
            <ItemDescription>Distance</ItemDescription>
            <ItemTitle>
              <CountUp from={0} to={Math.round(distance)} separator="," />
            </ItemTitle>
          </ItemContent>
          <ItemContent>
            <ItemDescription>Points</ItemDescription>
            <ItemTitle>
              <CountUp from={0} to={points} separator="," />
            </ItemTitle>
          </ItemContent>
          <ItemContent>
            <ItemDescription>Total Points</ItemDescription>
            <ItemTitle>
              <CountUp from={0} to={totalPoints} separator="," />
            </ItemTitle>
          </ItemContent>
        </Item>
        <ChartContainer config={chartConfig} className="min-h-50 w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
        <DrawerFooter>
          <DrawerClose
            render={
              <Button onClick={onNext} size="lg">
                {isLastRound ? "Results" : "Next Round"}
                <ArrowRightIcon />
              </Button>
            }
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
