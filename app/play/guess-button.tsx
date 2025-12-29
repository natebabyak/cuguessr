import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function GuessButton() {
  const handleClick = () => {
    console.log("Guess");
  };

  return (
    <Button onClick={handleClick} className="rounded-full">
      <Check />
      Make Guess
    </Button>
  );
}
