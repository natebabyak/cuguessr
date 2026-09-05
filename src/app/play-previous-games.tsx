"use client";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MIN_DATE } from "@/lib/constants";

export function PlayPreviousGames() {
  const startDate = new Date(MIN_DATE);
  const today = new Date();

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <CalendarIcon />
        Play Previous Games
      </PopoverTrigger>
      <PopoverContent align="center" className="bg-background">
        <Calendar
          captionLayout="dropdown"
          components={{
            DayButton: ({ day, modifiers, className, children, ...props }) => {
              const { isoDate } = day;

              if (modifiers.disabled) {
                return (
                  <CalendarDayButton
                    day={day}
                    modifiers={modifiers}
                    className={className}
                    {...props}
                  >
                    {children}
                  </CalendarDayButton>
                );
              }

              return (
                <CalendarDayButton
                  day={day}
                  modifiers={modifiers}
                  className={className}
                  render={
                    <Link href={`/daily/${isoDate}`} data-day={isoDate} />
                  }
                  {...props}
                >
                  {children}
                </CalendarDayButton>
              );
            },
          }}
          disabled={[{ before: startDate }, { after: today }]}
          mode="single"
          timeZone="America/Toronto"
          startMonth={startDate}
          endMonth={today}
        />
      </PopoverContent>
    </Popover>
  );
}
