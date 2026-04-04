"use client";

import { Button } from "@/components/ui/button";
import { Calendar, ImageIcon, Play } from "lucide-react";
import { cn, getDailyNumber } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { FaqSection } from "@/components/home/faq-section";
import { Footer } from "@/components/home/footer";

export default function Page() {
  const dailyNumber = getDailyNumber();
  const { scrollY } = useScroll();

  const scale = useTransform(scrollY, [0, 800], [1, 1.2]);

  const titleRef = useRef(null);

  const isTitleInView = useInView(titleRef, { margin: "-65px 0px 0px 0px" });

  return (
    <>
      <header
        className={cn(
          "bg-background/80 fixed top-0 left-0 z-50 w-full border-b border-transparent px-4 py-4 backdrop-blur-md transition-colors md:px-8",
          scrollY.get() > 0 && "border-border",
        )}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={24} height={24} />
            <motion.h1
              initial={false}
              animate={{ opacity: !isTitleInView ? 1 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-2xl font-bold"
            >
              <span className="text-primary">cu</span>
              Guessr
            </motion.h1>
          </Link>
          <Button asChild size="sm">
            <Link href="/classic">
              <Play />
              Play Now
            </Link>
          </Button>
        </div>
      </header>
      <main>
        <article>
          <section className="relative h-svh overflow-hidden">
            <motion.div style={{ scale }} className="absolute inset-0 -z-50">
              <Image
                alt="Background"
                fill
                src="/bg.webp"
                className="object-cover object-center"
              />
            </motion.div>
            <div className="from-background absolute -top-px -right-px -left-px -z-40 h-16.25 bg-linear-to-b to-transparent" />
            <div className="from-background absolute -right-px -bottom-px -left-px -z-40 h-1/2 bg-linear-to-t to-transparent" />
            <Card className="bg-background/90 animate-in fade-in-0 slide-in-from-bottom-10 absolute top-1/2 left-1/2 z-0 w-full max-w-xs -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm duration-1000 ease-in-out sm:max-w-sm md:max-w-lg">
              <CardHeader>
                <CardTitle>
                  <h1
                    ref={titleRef}
                    className="text-center text-6xl font-bold sm:text-7xl md:text-8xl"
                  >
                    <span className="text-primary">cu</span>
                    Guessr
                  </h1>
                </CardTitle>
                <CardDescription>
                  <p className="text-center text-lg leading-tight font-medium text-balance sm:text-xl md:text-2xl">
                    How well do you know the Carleton campus?
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mx-auto grid w-full max-w-xs gap-2">
                  <Button
                    asChild
                    size="lg"
                    className="duration-500 hover:scale-105 hover:rotate-1"
                  >
                    <Link href="/daily">
                      <Calendar />
                      Daily Challenge #{dailyNumber}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="duration-500 hover:scale-105 hover:rotate-1"
                  >
                    <Link href="/classic">
                      <Play />
                      Play Classic
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="duration-500 hover:scale-105 hover:rotate-1"
                  >
                    <Link href="/submit">
                      <ImageIcon />
                      Submit a Photo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
          <div className="bg-background p-4">
            <FaqSection />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
