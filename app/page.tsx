"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { ImageIcon, Moon, Play, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-[url(/cu.jpg)] w-screen h-screen bg-cover bg-center">
      <div className="size-full backdrop-blur-sm bg-black/10">
        <div className="absolute w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
          <h1 className="text-6xl md:text-8xl font-black text-shadow-lg text-shadow-black/30 text-center">
            <span className="text-primary">cu</span>
            <span className="text-white">Guessr</span>
          </h1>
          <p className="text-xl md:text-2xl text-center text-white text-shadow-lg font-medium text-balance leading-tight text-shadow-black/30">
            How well do you know the Carleton campus?
          </p>
          <ButtonGroup
            orientation="vertical"
            className="max-w-sm w-full mx-auto px-4"
          >
            <ButtonGroup className="w-full">
              <Button asChild className="w-full">
                <Link href="/play">
                  <Play />
                  Play
                </Link>
              </Button>
            </ButtonGroup>
            <ButtonGroup className="w-full">
              <Button asChild variant="outline" className="w-full">
                <Link href="/upload">
                  <ImageIcon />
                  Upload Photo
                </Link>
              </Button>
            </ButtonGroup>
          </ButtonGroup>
        </div>
        <footer className="p-4 absolute left-0 bottom-0 w-full flex flex-col items-center gap-2">
          <Button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            size="lg"
            variant="ghost"
            className="text-white"
          >
            <div className="size-4 relative">
              <Sun
                className={cn(
                  "absolute dark:scale-100 dark:rotate-0 scale-0 rotate-90 transition-transform!",
                )}
              />
              <Moon
                className={cn(
                  "absolute dark:scale-0 scale-100 rotate-0 dark:rotate-90 transition-transform!",
                )}
              />
            </div>
            Switch to {theme === "light" ? "dark" : "light"} theme
          </Button>
          <p className="text-white text-shadow-lg text-shadow-black/30">
            &copy; 2025-{new Date().getFullYear()} Nate Babyak. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
