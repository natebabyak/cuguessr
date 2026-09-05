import * as v from "valibot";

export const NameSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(3, "Name must be at least 3 characters."),
    v.maxLength(30, "Name must be at most 30 characters."),
  ),
});

export type Name = v.InferOutput<typeof NameSchema>;
