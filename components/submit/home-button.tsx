import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

export function HomeButton() {
  return (
    <Button
      asChild
      size="icon-lg"
      className="pointer-events-auto self-end justify-self-start rounded-full hover:scale-105"
    >
      <Link href="/">
        <LogOut className="rotate-180" />
      </Link>
    </Button>
  );
}
