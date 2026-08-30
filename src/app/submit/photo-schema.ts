import * as v from "valibot";

export const PhotoSchema = v.object({
  photo: v.pipe(
    v.file("Please select an image file."),
    v.check(
      (file) => file.type.startsWith("image/"),
      "Please select an image file.",
    ),
    v.maxSize(10 * 1024 * 1024, "Please select a file smaller than 10 MB."),
  ),
  latitude: v.pipe(v.number(), v.minValue(-90), v.maxValue(90)),
  longitude: v.pipe(v.number(), v.minValue(-180), v.maxValue(180)),
});

export type Photo = v.InferOutput<typeof PhotoSchema>;
