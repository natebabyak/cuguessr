import { SendIcon } from "lucide-react";
import { Button } from "#/components/ui/button";

export function SubmitGuessButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      size="lg"
      className="pointer-events-auto rounded-full"
    >
      <SendIcon />
      Submit Guess
    </Button>
  );
}
