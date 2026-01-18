"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Trophy, RotateCcw } from "lucide-react";
import { calculateDistance } from "@/lib/math";
import type { Coordinates } from "@/lib/math";

interface RoundResult {
  round: number;
  distance: number;
  score: number;
  guessCoordinates: Coordinates;
  answerCoordinates: Coordinates;
}

interface ResultsScreenProps {
  totalScore: number;
  roundResults: RoundResult[];
  onPlayAgain: () => void;
}

function getScoreEmoji(score: number): string {
  if (score >= 4000) return "🟩"; // Excellent (green)
  if (score >= 3000) return "🟨"; // Good (yellow)
  if (score >= 2000) return "🟧"; // Okay (orange)
  if (score >= 1000) return "🟥"; // Poor (red)
  return "⬛"; // Very poor (black)
}

function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
}

export function ResultsScreen({
  totalScore,
  roundResults,
  onPlayAgain,
}: ResultsScreenProps) {
  const handleShare = async () => {
    const emojiGrid = roundResults
      .map((result) => getScoreEmoji(result.score))
      .join("");

    const shareText = `CUGUESSR\n\nScore: ${totalScore.toLocaleString()}\n\n${emojiGrid}\n\nPlay at ${window.location.origin}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "CUGUESSR Results",
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        // User cancelled or error occurred
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        // You could show a toast notification here
        alert("Results copied to clipboard!");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <CardTitle className="text-3xl">Game Complete!</CardTitle>
          </div>
          <p className="text-2xl font-bold text-primary">
            Final Score: {totalScore.toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Emoji Grid */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              Round Results
            </p>
            <div className="flex gap-2 text-4xl">
              {roundResults.map((result, index) => (
                <span key={index} title={`Round ${result.round + 1}`}>
                  {getScoreEmoji(result.score)}
                </span>
              ))}
            </div>
          </div>

          {/* Round Details */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Round Details
            </p>
            <div className="space-y-2">
              {roundResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getScoreEmoji(result.score)}
                    </span>
                    <div>
                      <p className="font-medium">Round {result.round + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistance(result.distance)} away
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{result.score.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleShare}
              className="flex-1"
              size="lg"
              variant="default"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Results
            </Button>
            <Button
              onClick={onPlayAgain}
              className="flex-1"
              size="lg"
              variant="outline"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
