import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";
import type { Coordinates } from "#/lib/types";

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

export function useRoundResultAnimation({
  isRoundOver,
  guess,
  answer,
  setLineProgress,
}: {
  isRoundOver: boolean;
  guess: Coordinates | null;
  answer: Coordinates | null;
  setLineProgress: (progress: number) => void;
}) {
  const { current: mapWrapper } = useMap();

  useEffect(() => {
    if (!isRoundOver || !guess || !answer || !mapWrapper) {
      return;
    }

    let cancelled = false;
    let raf: number | null = null;

    setLineProgress(0);

    const map = mapWrapper.getMap();

    map.flyTo({
      center: [guess.longitude, guess.latitude],
      zoom: 20,
      duration: 1000,
      easing: easeInOut,
    });

    const lineTimer = window.setTimeout(() => {
      const start = performance.now();
      const duration = 2000;

      const animate = (now: number) => {
        if (cancelled) return;

        const t = Math.min((now - start) / duration, 1);
        setLineProgress(easeInOut(t));

        if (t < 1) {
          raf = requestAnimationFrame(animate);
        }
      };

      raf = requestAnimationFrame(animate);
    }, 1000);

    const boundsTimer = window.setTimeout(() => {
      if (cancelled) return;

      map.fitBounds(
        [
          [
            Math.min(guess.longitude, answer.longitude),
            Math.min(guess.latitude, answer.latitude),
          ],
          [
            Math.max(guess.longitude, answer.longitude),
            Math.max(guess.latitude, answer.latitude),
          ],
        ],
        {
          bearing: 0,
          duration: 2000,
          easing: easeInOut,
          padding: {
            top: 100,
            bottom: 200,
            left: 50,
            right: 50,
          },
        },
      );
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(lineTimer);
      clearTimeout(boundsTimer);

      if (raf !== null) {
        cancelAnimationFrame(raf);
      }
    };
  }, [isRoundOver, guess, answer, mapWrapper, setLineProgress]);
}
