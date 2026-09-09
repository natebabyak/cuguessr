import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>404 - Not Found</EmptyTitle>
          <EmptyDescription>This page does not exist... yet.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/" className={buttonVariants()}>
            <ArrowLeftIcon />
            Go Home
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
}
