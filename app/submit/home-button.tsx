import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export function HomeButton() {
  return (
    <Button
      asChild
      size="icon"
      className="absolute z-10 rounded-full md:left-4 left-2 bottom-10 md:bottom-12"
    >
      <Link href="/">
        <Home />
      </Link>
    </Button>
  );
}
