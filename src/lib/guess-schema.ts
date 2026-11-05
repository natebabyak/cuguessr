import z from "zod";

export const guessSchema = z.object({
  roundId: z.int().positive(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type Guess = z.infer<typeof guessSchema>;
