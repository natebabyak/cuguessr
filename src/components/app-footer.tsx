"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AppFooter() {
  const { setTheme, theme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <footer className="grid p-8">
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/daily">Daily</Link>
          </li>
          <li>
            <Link
              href="/leaderboard"
              className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
            >
              Leaderboard
            </Link>
          </li>
          <li>
            <Link href="/submit">Submit</Link>
          </li>
        </ul>
      </nav>
      <p>&copy; 2025-2026 Nate Babyak</p>
      <a href="mailto:support@cuguessr.com" className={buttonVariants()}>
        Contact Support
      </a>
      <Tabs value={mounted && theme} onValueChange={setTheme}>
        <TabsList>
          <TabsTrigger value="light">
            <SunIcon />
          </TabsTrigger>
          <TabsTrigger value="dark">
            <MoonIcon />
          </TabsTrigger>
          <TabsTrigger value="system">
            <MonitorIcon />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </footer>
  );
}
