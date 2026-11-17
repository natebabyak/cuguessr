import { createServerFn } from "@tanstack/react-start";

import {
  adminQueueSchema,
  moderatePhotoSchema,
  respondToReportSchema,
  rotatePhotoSchema,
} from "./admin-schema";
import {
  getAdminQueue,
  moderatePhoto,
  requireAdmin,
  respondToReport,
  rotatePhoto,
} from "./admin.server";
import { getSession } from "./auth.functions";

export const requireAdminFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin((await getSession())?.user.id);
});

export const getAdminQueueFn = createServerFn({ method: "GET" })
  .validator(adminQueueSchema)
  .handler(async ({ data }) => getAdminQueue((await getSession())?.user.id, data));

export const moderatePhotoFn = createServerFn({ method: "POST" })
  .validator(moderatePhotoSchema)
  .handler(async ({ data }) => moderatePhoto((await getSession())?.user.id, data));

export const rotatePhotoFn = createServerFn({ method: "POST" })
  .validator(rotatePhotoSchema)
  .handler(async ({ data }) => rotatePhoto((await getSession())?.user.id, data));

export const respondToReportFn = createServerFn({ method: "POST" })
  .validator(respondToReportSchema)
  .handler(async ({ data }) => respondToReport((await getSession())?.user.id, data));
