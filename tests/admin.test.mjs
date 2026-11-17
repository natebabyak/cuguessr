import { describe, expect, test } from "bun:test";

import {
  adminQueueSchema,
  moderatePhotoSchema,
  respondToReportSchema,
  rotatePhotoSchema,
} from "../src/lib/admin-schema";
import { photoDimensions, photoUrl } from "../src/lib/photo-url";

describe("admin moderation validation", () => {
  test("normalizes invalid queue parameters without allowing unbounded pages", () => {
    expect(adminQueueSchema.parse({ tab: "secret", status: "invalid", page: "-1" })).toEqual({
      tab: "photos",
      status: "pending",
      page: 1,
    });
    expect(adminQueueSchema.parse({ tab: "reports", status: "rejected", page: "2" }).page).toBe(2);
    expect(adminQueueSchema.parse({ page: Infinity }).page).toBe(1);
  });

  test("requires known moderation actions, record ids, and revisions", () => {
    for (const data of [
      { photoId: 0, revision: 0, status: "approved" },
      { photoId: 1, status: "approved" },
      { photoId: 1, revision: -1, status: "approved" },
      { photoId: 1, revision: 0, status: "deleted" },
    ]) {
      expect(moderatePhotoSchema.safeParse(data).success).toBe(false);
    }
    expect(
      rotatePhotoSchema.safeParse({ photoId: 1, revision: 0, direction: "upside-down" }).success,
    ).toBe(false);
    expect(rotatePhotoSchema.parse({ photoId: 1, revision: 0, direction: "left" }).direction).toBe(
      "left",
    );
  });

  test("requires a bounded internal response and trims it before persistence", () => {
    const data = { reportId: 1, revision: 0, status: "approved", response: " Checked and fixed. " };
    expect(respondToReportSchema.parse(data).response).toBe("Checked and fixed.");
    for (const response of ["   ", "x".repeat(2001)])
      expect(respondToReportSchema.safeParse({ ...data, response }).success).toBe(false);
    expect(respondToReportSchema.safeParse({ ...data, reportId: -1 }).success).toBe(false);
  });

  test("rotation swaps display axes and changes the image cache URL without changing the object key", () => {
    expect(photoDimensions(800, 600, 90)).toEqual({ width: 600, height: 800 });
    expect(photoDimensions(800, 600, 270)).toEqual({ width: 600, height: 800 });
    expect(photoDimensions(800, 600, 180)).toEqual({ width: 800, height: 600 });
    expect(photoUrl("photo name?.jpg", 800, 90)).toContain("rotate=90/photos/photo%20name%3F.jpg");
    expect(photoUrl("photo.jpg", 800)).not.toContain("rotate=");
  });
});
