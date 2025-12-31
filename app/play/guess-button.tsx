import { Button } from "@/components/ui/button";
import { Coordinates } from "@/lib/math";
import { Check } from "lucide-react";

interface GuessButtonProps {
  guessCoordinates: Coordinates | null;
  handleClick: () => void;
}

export function GuessButton({
  guessCoordinates,
  handleClick,
}: GuessButtonProps) {
  return (
    <Button
      disabled={!guessCoordinates}
      onClick={handleClick}
      className="rounded-full"
    >
      <Check />
      Make Guess
    </Button>
  );
}
