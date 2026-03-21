"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { ExternalLink, LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function Footer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-background border-t p-8">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-y-8 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-2">
          <h2
            id="footer-navigation-heading"
            className="text-muted-foreground text-xs font-bold uppercase"
          >
            Navigation
          </h2>
          <nav
            aria-label="Footer Navigation"
            aria-labelledby="footer-navigation-heading"
          >
            <ul className="flex flex-col gap-1 text-xl font-medium">
              <FooterLink href="/classic" label="Classic" />
              <FooterLink href="/daily" label="Daily" />
              <FooterLink href="/" label="Home" />
              <FooterLink href="/submit" label="Submit" />
            </ul>
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          <h2
            id="footer-links-heading"
            className="text-muted-foreground text-xs font-bold uppercase"
          >
            Links
          </h2>
          <nav aria-label="Footer Links" aria-labelledby="footer-links-heading">
            <ul className="flex flex-col gap-1 text-xl font-medium underline-offset-4">
              <FooterLink
                href="https://github.com/natebabyak/cuguessr/discussions"
                label="Discussions"
              />
              <FooterLink
                href="https://github.com/natebabyak/cuguessr"
                label="GitHub"
              />
              <FooterLink
                href="https://github.com/natebabyak/cuguessr/issues"
                label="Issues"
              />
              <FooterLink
                href="https://github.com/sponsors/natebabyak"
                label="Sponsor"
              />
            </ul>
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="hardModeSwitch"
              className="text-muted-foreground text-xs font-bold uppercase"
            >
              Hard Mode
            </Label>
            <Switch disabled id="hardModeSwitch" />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="modeButtonGroup"
              className="text-muted-foreground text-xs font-bold uppercase"
            >
              Mode
            </Label>
            {mounted && (
              <ButtonGroup id="modeButtonGroup" className="rounded-full border">
                <ModeButton mode="system" Icon={Monitor} />
                <ModeButton mode="light" Icon={Sun} />
                <ModeButton mode="dark" Icon={Moon} />
              </ButtonGroup>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-auto text-sm">
          {new Date().getFullYear()} &copy; Nate Babyak
          <br />
          Thanks for playing!
        </p>
      </div>
    </footer>
  );

  function ModeButton({ mode, Icon }: { mode: string; Icon: LucideIcon }) {
    return (
      <Button
        onClick={() => setTheme(mode)}
        size="icon-sm"
        variant="ghost"
        className="group rounded-full hover:bg-inherit dark:hover:bg-inherit"
      >
        <div
          className={cn(
            "group-hover:bg-accent dark:group-hover:bg-accent/50 rounded-full p-1",
            theme === mode && "bg-primary!",
          )}
        >
          <Icon className={cn(theme === mode && "text-primary-foreground")} />
        </div>
      </Button>
    );
  }
}
function FooterLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith("/")) {
    return (
      <li>
        <Link
          href={href}
          className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
        >
          {label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        className="group flex w-fit items-center gap-2"
      >
        <span className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 group-hover:after:origin-left group-hover:after:scale-x-100">
          {label}
        </span>
        <ExternalLink className="text-muted-foreground size-4" />
      </Link>
    </li>
  );
}
