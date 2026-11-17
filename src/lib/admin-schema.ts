import z from "zod";

export const moderationStatus = z.enum(["pending", "approved", "rejected"]);
export const adminQueueSchema = z.object({
  tab: z.enum(["photos", "reports"]).catch("photos"),
  status: moderationStatus.catch("pending"),
  page: z.coerce.number().int().min(1).max(100_000).catch(1),
});

const revision = z.int().nonnegative();
export const moderatePhotoSchema = z.object({
  photoId: z.int().positive(),
  revision,
  status: moderationStatus,
});
export const rotatePhotoSchema = z.object({
  photoId: z.int().positive(),
  revision,
  direction: z.enum(["left", "right"]),
});
export const respondToReportSchema = z.object({
  reportId: z.int().positive(),
  revision,
  status: moderationStatus,
  response: z.string().trim().min(1, "Enter an internal response.").max(2000),
});

export type AdminQueue = z.infer<typeof adminQueueSchema>;
