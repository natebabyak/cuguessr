"use client";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ImageIcon, Moon, Play, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { getDailyNumber } from "@/lib/utils";

export default function Page() {
  const dailyNumber = getDailyNumber();
  const { theme, setTheme } = useTheme();
  return (
    <>
      <div className="fixed top-0 left-0 h-lvh w-screen">
        <Image
          src="/cu.jpg"
          alt="bg"
          fill
          preload
          loading="eager"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm dark:bg-black/50" />
      </div>
      <div className="relative z-10 flex h-svh w-screen flex-col overflow-hidden">
        <div className="animate-in slide-in-from-bottom-5 fade-in-0 flex flex-1 flex-col items-center justify-center gap-4 duration-700">
          <h1 className="text-center text-6xl font-black text-shadow-black/30 text-shadow-lg md:text-8xl">
            <span className="text-primary">cu</span>
            <span className="text-white">Guessr</span>
          </h1>
          <p className="text-center text-xl leading-tight font-medium text-balance text-white text-shadow-black/30 text-shadow-lg md:text-2xl">
            How well do you know the Carleton campus?
          </p>
          <div className="grid w-full max-w-sm grid-cols-2 gap-2 px-4">
            <Button
              asChild
              disabled
              className="col-span-2 shadow-lg shadow-black/25 dark:shadow-white/25"
            >
              <Link href="/daily">
                <Calendar />
                Daily Challenge #{dailyNumber}
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="shadow-lg shadow-black/25 dark:shadow-white/25"
            >
              <Link href="/classic">
                <Play />
                Classic
              </Link>
            </Button>
            <Button
              disabled
              variant="secondary"
              className="shadow-lg shadow-black/25 dark:shadow-white/25"
            >
              <Clock />
              Coming soon...
            </Button>
            <Button
              asChild
              variant="secondary"
              className="col-span-2 shadow-lg shadow-black/25 dark:shadow-white/25"
            >
              <Link href="/submit">
                <ImageIcon />
                Submit Photo
              </Link>
            </Button>
          </div>
        </div>
        <footer className="mt-auto flex flex-col items-center justify-center gap-2 p-4">
          <Button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            size="icon-sm"
            variant="secondary"
            className="shadow-lg shadow-black/25 dark:shadow-white/25"
          >
            <Sun className="scale-100 rotate-0 transition-transform! dark:scale-0 dark:rotate-45" />
            <Moon className="absolute scale-0 -rotate-45 transition-transform! dark:scale-100 dark:rotate-0" />
          </Button>
          <p className="text-primary-foreground text-shadow-black/25 text-shadow-lg">
            &copy; {new Date().getFullYear()} Nate Babyak. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
