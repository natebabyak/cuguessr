import * as v from "valibot";

export const ReportSchema = v.object({
  photoId: v.pipe(v.number(), v.integer()),
  description: v.pipe(
    v.string(),
    v.minLength(5, "Description must be at least 5 characters."),
    v.maxLength(255, "Description must be at most 255 characters."),
  ),
});

export type Report = v.InferOutput<typeof ReportSchema>;
