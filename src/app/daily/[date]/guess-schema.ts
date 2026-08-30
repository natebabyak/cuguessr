import * as v from "valibot";

export const GuessSchema = v.object({
  roundId: v.pipe(v.number(), v.integer()),
  latitude: v.pipe(v.number(), v.minValue(-90), v.maxValue(90)),
  longitude: v.pipe(v.number(), v.minValue(-180), v.maxValue(180)),
});

export type Guess = v.InferOutput<typeof GuessSchema>;
