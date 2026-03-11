import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export function HomeButton() {
  return (
    <Button
      asChild
      size="icon-lg"
      className="pointer-events-auto self-end justify-self-start rounded-full"
    >
      <Link href="/">
        <Home />
      </Link>
    </Button>
  );
}
