import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const faqItems = [
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
        </Link>{" "}
        or on Instagram at{" "}
        <Link
          href="https://www.instagram.com/nate.babyak/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          @nate.babyak
        </Link>
        . Bug reports, suggestions, and feedback are always welcome.
      </>
    ),
  },
];

export function FaqSection() {
  return (
    <section className="flex min-h-[50svh] flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-5xl font-bold sm:text-6xl md:text-7xl">FAQ</h2>
      <Accordion
        collapsible
        type="single"
        className="w-full max-w-lg rounded-lg border"
      >
        {faqItems.map((item, index) => (
          <AccordionItem
            key={index}
            value={`question-${index + 1}`}
            className="border-b px-4 last:border-b-0"
          >
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
