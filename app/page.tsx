import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CircleQuestionMark, Play } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div>Logo placeholder</div>
      <h1>cuGuessr</h1>
      <p>How well do you know the Carleton campus?</p>
      <ButtonGroup orientation="vertical">
        <ButtonGroup>
          <Button asChild>
            <Link href="play">
              <Play />
              Start Game
            </Link>
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CircleQuestionMark />
                How to Play
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How to Play cuGuessr</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </ButtonGroup>
      </ButtonGroup>
      <p className="text-center text-muted-foreground mt-4">
        &copy; {new Date().getFullYear()} Nate Babyak. All rights reserved.
      </p>
    </div>
  );
}
