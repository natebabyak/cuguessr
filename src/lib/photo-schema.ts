import z from "zod";

export const createPhotoSchema = z.object({
  photo: z
    .file()
    .max(10 * 1024 * 1024, "Choose an image no larger than 10 MiB.")
    .refine((file) => file.type.startsWith("image/"), "Choose an image file."),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;
