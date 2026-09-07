"use client";

import { ArrowUpRightIcon, MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

export function Footer() {
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <footer className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 flex-col gap-2 rounded-4xl border bg-background/80 p-8">
      <nav>
        <ul className="flex justify-center gap-4">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/daily">Daily</Link>
          </li>
          <li>
            <Link href="/leaderboard">Leaderboard</Link>
          </li>
          <li>
            <Link href="/privacy">Privacy</Link>
          </li>
          <li>
            <Link href="/submit">Submit</Link>
          </li>
        </ul>
      </nav>
      <div className="flex items-center justify-between">
        <p>&copy; 2025-2026 Nate Babyak</p>
        <div className="flex items-center gap-2">
          <a
            href="mailto:support@cuguessr.com"
            className={buttonVariants({
              variant: "secondary",
              size: "sm",
            })}
          >
            Contact Support
            <ArrowUpRightIcon />
          </a>
          <Button
            onClick={() =>
              setTheme(mounted && resolvedTheme === "light" ? "dark" : "light")
            }
            size="icon"
            variant="ghost"
          >
            {mounted && resolvedTheme === "light" ? <SunIcon /> : <MoonIcon />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </footer>
  );
}
