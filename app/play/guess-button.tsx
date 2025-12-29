import { Button } from "@/components/ui/button";
import { Coordinates } from "@/lib/math";
import { Check } from "lucide-react";

interface GuessButtonProps {
  guessCoordinates: Coordinates | null;
}

export function GuessButton({ guessCoordinates }: GuessButtonProps) {
  const handleClick = () => {
    console.log("Guess");
  };

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
