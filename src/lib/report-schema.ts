import z from "zod";

export const reportSchema = z.object({
  photoId: z.int().positive(),
  description: z.string().trim().min(5, "Enter at least 5 characters.").max(255),
});
