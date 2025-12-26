import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export function HomeButton() {
  return (
    <Button
      asChild
      size="icon"
      className="absolute z-10 rounded-full left-4 bottom-12"
    >
      <Link href="/">
        <Home />
      </Link>
    </Button>
  );
}
