"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";

const linkGroups: {
  label: string;
  links: {
    href: Route;
    label: string;
  }[];
}[] = [
  {
    label: "cuGuessr",
    links: [
      {
        href: "/",
        label: "Home",
      },
      {
        href: "/daily",
        label: "Daily",
      },
      {
        href: "/submit",
        label: "Submit",
      },
    ],
  },
  {
    label: "GitHub",
    links: [
      {
        href: "https://github.com/natebabyak/cuguessr/discussions",
        label: "Discussions",
      },
      {
        href: "https://github.com/natebabyak/cuguessr",
        label: "GitHub",
      },
      {
        href: "https://github.com/natebabyak/cuguessr/issues",
        label: "Issues",
      },
      {
        href: "https://github.com/sponsors/natebabyak",
        label: "Sponsor",
      },
    ],
  },
  {
    label: "Support",
    links: [
      {
        href: "mailto:support@cuguessr.com",
        label: "Contact",
      },
      {
        href: "/privacy",
        label: "Privacy",
      },
    ],
  },
];

export function Footer() {
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <footer className="flex flex-col border-t">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 p-8 sm:grid-cols-4">
        {linkGroups.map((linkGroup) => (
          <div key={linkGroup.label} className="flex flex-col gap-2">
            <p className="font-medium text-muted-foreground text-xs">
              {linkGroup.label}
            </p>
            <Separator />
            <nav>
              <ul className="flex flex-col gap-1">
                {linkGroup.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      rel={
                        link.href.startsWith("/")
                          ? undefined
                          : "noopener noreferrer"
                      }
                      target={link.href.startsWith("/") ? undefined : "_blank"}
                      className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ))}
        <div className="mt-auto flex flex-col gap-2">
          <Button
            onClick={() =>
              setTheme(mounted && resolvedTheme === "light" ? "dark" : "light")
            }
            size="icon-sm"
            title="Toggle theme"
            variant="outline"
          >
            {mounted && resolvedTheme === "light" ? <SunIcon /> : <MoonIcon />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <p className="text-muted-foreground text-sm">
            &copy; 2025-2026 Nate Babyak. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
