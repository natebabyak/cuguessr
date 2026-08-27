import { SendIcon } from "lucide-react";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import type { Coordinates } from "@/lib/types";

export function SubmitGuessButton({ guess }: { guess: Coordinates | null }) {
  const { mutate } = useSWRConfig();

  function submitGuess() {
    if (!guess) return;

    mutate(`/api/rounds/`);
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
