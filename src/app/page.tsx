import { CalendarIcon, ImageIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FAQ_ITEMS = [
  {
    question: "Can I submit a photo?",
    answer: (
      <>
        Yes! Submit photos taken anywhere on Carleton&apos;s campus{" "}
        <Link href="/submit" className="underline underline-offset-4">
          here
        </Link>
        . Every submission is reviewed before going live and can be removed at
        any time.
      </>
    ),
  },
  {
    question: "What do I do if I think an answer is incorrect?",
    answer:
      "Hit the report button in the bottom right after making a guess. You can view the photo again before submitting to help explain the issue.",
  },
  {
    question: "How do I contact the creator?",
    answer: (
      <>
        Open a{" "}
        <Link
          href="https://github.com/natebabyak/cuguessr/discussions"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          GitHub Discussion
        </Link>{" "}
        or{" "}
        <Link
          href="https://github.com/natebabyak/cuguessr/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Issue
        </Link>{" "}
        if you have a GitHub account, or reach out by{" "}
        <Link
          href="mailto:nate.babyak@outlook.com"
          className="underline underline-offset-4"
        >
          email
        </Link>
        . Bug reports, suggestions, and feedback are always welcome.
      </>
    ),
  },
] as {
  question: string;
  answer: React.ReactNode;
}[];

export default function Page() {
  return (
    <div>
      <header className="flex items-center justify-between p-4">
        <Link href="/" className="font-semibold text-2xl">
          <span className="text-primary">cu</span>
          Guessr
        </Link>
        <Link href="/daily" className={buttonVariants()}>
          Play Today's Game
        </Link>
      </header>
      <main>
        <section>
          <h1 className="text-balance font-medium text-5xl">
            Test your knowledge of the CU campus
          </h1>
          <ButtonGroup>
            <Link href="/daily" className={buttonVariants()}>
              <CalendarIcon />
              Play Today's Game
            </Link>
            <Popover>
              <PopoverTrigger render={<Button size="icon" />}>
                <PlusIcon />
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  captionLayout="dropdown"
                  mode="single"
                  timeZone="America/Toronto"
                />
              </PopoverContent>
            </Popover>
          </ButtonGroup>
          <Link href="/submit" className={buttonVariants()}>
            <ImageIcon />
            Submit Photo
          </Link>
        </section>
        <section>
          <h2>FAQ</h2>
          <Accordion>
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <footer>
        <p>&copy; 2025-2026 Nate Babyak</p>
      </footer>
    </div>
  );
}
