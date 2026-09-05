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
    <footer className="border-t p-8">
      <div className="grid max-w-5xl md:grid-cols-2 2xl:grid-cols-4">
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-muted-foreground text-xs uppercase">
            Navigation
          </p>
          <nav>
            <ul>
              <li>
                <Link
                  href="/"
                  className="relative text-lg after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/daily"
                  className="relative text-lg after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
                >
                  Daily
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="relative text-lg after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="relative text-lg after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
                >
                  Submit
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-muted-foreground text-xs uppercase">
            Links
          </p>
          <nav>
            <ul>
              <li>
                <a
                  href="https://github.com/natebabyak/cuguessr/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative text-lg after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
                >
                  Discussions
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/natebabyak/cuguessr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative text-lg after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/natebabyak/cuguessr/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative text-lg after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
                >
                  Issues
                </a>
              </li>

              <li>
                <a
                  href="https://github.com/sponsors/natebabyak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative text-lg after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
                >
                  Sponsor
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <p>cuGuessr is not affiliated with Carleton University</p>
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
      </div>
    </footer>
  );
}
