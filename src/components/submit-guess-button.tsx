import { SendIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import type { Coordinates } from "#/lib/types";

export function SubmitGuessButton({ guess }: { guess: Coordinates | null }) {
  function submitGuess() {
    if (!guess) return;
  }

  return (
    <Button
      disabled={!guess}
      onClick={submitGuess}
      size="lg"
      className="pointer-events-auto rounded-full"
    >
      <SendIcon />
      Submit Guess
    </Button>
  );
}
