import { ArrowRightIcon } from "lucide-react";
import CountUp from "@/components/CountUp";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

export function RoundResultItem({
  distance,
  points,
  totalPoints,
  isLastRound,
  handleClick,
}: {
  distance: number;
  points: number;
  totalPoints: number;
  isLastRound: boolean;
  handleClick: () => void;
}) {
  return (
    <Item
      variant="outline"
      className="grid grid-cols-3 bg-background md:grid-cols-4"
    >
      <ItemContent className="*:ml-auto">
        <ItemDescription>Distance</ItemDescription>
        <ItemTitle className="text-2xl">
          <CountUp from={0} to={distance} duration={1} separator="," />m
        </ItemTitle>
      </ItemContent>
      <ItemContent className="*:ml-auto">
        <ItemDescription>Points</ItemDescription>
        <ItemTitle className="text-2xl">
          <CountUp from={0} to={points} duration={1} separator="," />
        </ItemTitle>
      </ItemContent>
      <ItemContent className="*:ml-auto">
        <ItemDescription>Total Points</ItemDescription>
        <ItemTitle className="text-2xl">
          <CountUp
            from={totalPoints - points}
            to={totalPoints}
            duration={1}
            separator=","
          />
        </ItemTitle>
      </ItemContent>
      <ItemActions className="col-span-3 md:col-span-1">
        <Button onClick={handleClick} size="lg" className="ml-auto">
          {isLastRound ? "Results" : "Next Round"}
          <ArrowRightIcon />
        </Button>
      </ItemActions>
    </Item>
  );
}
